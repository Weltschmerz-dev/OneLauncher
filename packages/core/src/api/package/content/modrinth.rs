use std::fmt::{Display, Formatter};

use crate::data::{Loader, ManagedPackage, ManagedVersion, PackageType};
use crate::store::{ManagedVersionFile, PackageFile, PackageSide, ProviderSearchResults, SearchResult};
use crate::utils::http::fetch;
use crate::{Result, State};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::Providers;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ModrinthPackage {
	pub slug: String,
	pub title: String,
	#[serde(default)]
	pub description: String,
	#[serde(default)]
	pub categories: Vec<String>,
	pub client_side: PackageSide,
	pub server_side: PackageSide,
	#[serde(default)]
	pub body: String,
	#[serde(default)]
	#[serde(alias = "display_categories")]
	pub additional_categories: Vec<String>,
	// pub issues_url: String,
	// pub source_url: String,
	// pub wiki_url: String,
	// pub discord_url: String,
	// pub donation_urls: Vec<DonationUrl>,
	pub project_type: PackageType,
	pub downloads: u32,
	#[serde(default)]
	pub icon_url: String,
	#[serde(alias = "project_id")]
	pub id: String,
	pub team: String,
	#[serde(alias = "date_created")]
	pub published: DateTime<Utc>,
	#[serde(alias = "date_modified")]
	pub updated: DateTime<Utc>,
	pub followers: u32,
	#[serde(default)]
	pub versions: Vec<String>,
	pub game_versions: Vec<String>,
	#[serde(default)]
	pub loaders: Vec<Loader>,
	#[serde(default)]
	pub gallery: Vec<Gallery>,
}

impl From<ModrinthPackage> for ManagedPackage {
	fn from(value: ModrinthPackage) -> ManagedPackage {
		ManagedPackage {
			provider: super::Providers::Modrinth,
			id: value.id,
			title: value.title,
			description: value.description,
			main: value.slug,
			versions: value.versions,
			game_versions: value.game_versions,
			loaders: value.loaders,
			icon_url: Some(value.icon_url),
			created: value.published,
			updated: value.updated,
			client: value.client_side,
			server: value.server_side,
			downloads: value.downloads,
			followers: value.followers,
			categories: value.categories,
			optional_categories: Some(value.additional_categories),
			uid: None,
			package_type: PackageType::Mod,
		}
	}
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DonationUrl {
	pub id: String,
	pub platform: String,
	pub url: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct License {
	pub id: String,
	pub name: String,
	pub url: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Gallery {
	pub url: String,
	pub featured: bool,
	pub title: String,
	pub description: String,
	pub created: String,
	pub ordering: i64,
}

#[derive(Deserialize)]
struct SearchResults {
	hits: Vec<SearchResult>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ModrinthVersion {
	pub game_versions: Vec<String>,
	pub loaders: Vec<String>,
	pub id: String,
	pub project_id: String,
	pub author_id: String,
	pub featured: bool,
	pub name: String,
	pub version_number: String,
	pub changelog: String,
	pub changelog_url: Option<String>,
	pub date_published: DateTime<Utc>,
	pub downloads: u32,
	pub version_type: String,
	pub status: String,
	pub requested_status: Value,
	pub files: Vec<File>,
	pub dependencies: Vec<Value>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct File {
	pub url: String,
	pub filename: String,
	pub primary: bool,
	pub size: u32,
	pub file_type: Option<PackageFile>,
}

impl From<File> for ManagedVersionFile {
	fn from(value: File) -> Self {
		ManagedVersionFile {
			url: value.url,
			file_name: value.filename,
			primary: value.primary,
			size: value.size,
			file_type: value.file_type,
			hashes: Default::default(), // TODO
		}
	}
}

impl From<ModrinthVersion> for ManagedVersion {
	fn from(value: ModrinthVersion) -> Self {
		ManagedVersion {
			id: value.id,
			package_id: value.project_id,
			author: value.author_id,
			name: value.name,

			featured: value.featured,
			version_id: value.version_number,
			changelog: value.changelog,
			changelog_url: value.changelog_url,

			published: value.date_published,
			downloads: value.downloads,
			version_type: value.version_type,

			files: value.files.into_iter().map(|f| f.into()).collect(),
			deps: vec![], // TODO [`ManagedDependency`]?
			game_versions: value.game_versions,
			loaders: value.loaders.into_iter().filter_map(|loader| Loader::try_from(loader).ok()).collect(),
		}
	}
}

macro_rules! format_url {
    ($($arg:tt)*) => {{
        format!("{}{}", crate::constants::MODRINTH_API_URL, format!($($arg)*))
    }};
}

pub async fn list() -> Result<Vec<ModrinthPackage>> {
	Ok(serde_json::from_slice(
		&fetch(
			format_url!("/projects_random?count=10").as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?)
}

pub async fn search<F>(query: Option<String>, limit: Option<u8>, facets: Option<F>) -> Result<ProviderSearchResults>
where
	F: FnOnce(FacetBuilder) -> String,
{
	let facets = facets.map_or(String::new(), |func| func(FacetBuilder::builder()));

	let results: SearchResults = serde_json::from_slice(
		&fetch(
			format_url!(
				"/search?query={}&limit={}{}",
				query.unwrap_or_default(),
				limit.unwrap_or(10),
				if facets.is_empty() { "".to_string() } else { format!("&facets={}", facets) }
			)
			.as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?;

    Ok(ProviderSearchResults {
		provider: Providers::Modrinth,
		results: results.hits,
	})
}

#[allow(dead_code)]
pub enum FacetOperation {
	NotEq,
	LargeEq,
	Large,
	SmallEq,
	Small,
	Eq,
}

impl Display for FacetOperation {
	fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
		f.write_str(match self {
			FacetOperation::NotEq => "!=",
			FacetOperation::LargeEq => ">=",
			FacetOperation::Large => ">",
			FacetOperation::SmallEq => "<=",
			FacetOperation::Small => "<",
			FacetOperation::Eq => "=",
		})
	}
}

pub struct Facet(pub String, pub FacetOperation, pub String);

impl Display for Facet {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		f.write_str(format!("{}{}{}", self.0, self.1, self.2).as_str())
	}
}

pub struct FacetBuilder {
	pub facets: Vec<Vec<Facet>>,
}

impl FacetBuilder {
	pub fn builder() -> Self {
		FacetBuilder { facets: vec![] }
	}

	pub fn and(&mut self, facet: Facet) -> &Self {
		self.facets.push(vec![facet]);
		self
	}

	pub fn or(&mut self, facet: Facet) -> &Self {
		let mut last_facet = self.facets.pop().unwrap_or_default();
		last_facet.push(facet);
		self.facets.push(last_facet);
		self
	}

	pub fn build(&self) -> String {
		let mut builder = String::new();

		for facet in &self.facets {
			builder.push('[');
			for (i, f) in facet.iter().enumerate() {
				if i != 0 {
					builder.push(',');
				}
				builder.push_str(f.to_string().as_str());
			}
			builder.push(']');
		}

		builder
	}
}

pub async fn get(id: &str) -> Result<ModrinthPackage> {
	Ok(serde_json::from_slice(
		&fetch(
			format_url!("/project/{}", id).as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?)
}

pub async fn get_multiple(ids: &[String]) -> Result<Vec<ModrinthPackage>> {
	Ok(serde_json::from_slice(
		&fetch(
			format_url!("/projects?ids=[{}]", ids.join(",")).as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?)
}

// TODO: modrinth api v3
// pub async fn get_org_projects(organization: &str) -> Result<>

pub async fn get_versions(project_id: &str) -> Result<Vec<ModrinthVersion>> {
	Ok(serde_json::from_slice(
		&fetch(
			format_url!("/project/{}/version", project_id).as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?)
}

pub async fn get_version(version_id: &str) -> Result<ModrinthVersion> {
	Ok(serde_json::from_slice(
		&fetch(
			format_url!("/version/{}", version_id).as_str(),
			None,
			&State::get().await?.fetch_semaphore,
		)
		.await?,
	)?)
}
