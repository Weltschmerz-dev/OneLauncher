import {
	DotsVerticalIcon,
	PlayIcon,
	PlusIcon,
	SearchMdIcon,
} from '@untitled-theme/icons-solid';
import { For, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { mergeRefs } from '@solid-primitives/refs';
import BannerBackground from '../../assets/images/header.png';
import Button from '../components/base/Button';
import TextField from '../components/base/TextField';
import ClusterRoot from './cluster/ClusterRoot';
import ClusterCover from '~ui/components/game/ClusterCover';
import type { Cluster } from '~bindings';
import useCommand from '~ui/hooks/useCommand';
import { bridge } from '~imports';
import { formatAsDuration, upperFirst } from '~utils';
import { useClusterCreator } from '~ui/components/overlay/cluster/ClusterCreationModal';
import { useLaunchCluster, useRecentCluster } from '~ui/hooks/useCluster';

type GroupedClusters = Record<string, Cluster[]>;

function HomePage() {
	const [clusters, { refetch }] = useCommand<GroupedClusters>(bridge.commands.getClustersGrouped);
	const controller = useClusterCreator();

	const containerIds = (list: GroupedClusters | undefined) => Object.keys(list || []);

	onMount(() => {
		bridge.events.clusterPayload.listen(({ payload }) => {
			if (payload.event === 'created' || payload.event === 'deleted')
				refetch();
		});
	});

	async function newCluster() {
		try {
			await controller.start();
		}
		catch (err) {
			console.error(err);
		}

		refetch();
	}

	// function getContainerByCluster(id: string) {
	// 	const list = clusters();

	// 	if (list === undefined)
	// 		return undefined;

	// 	if (list[id] !== undefined)
	// 		return id;

	// 	for (const [key, value] of Object.entries(list))
	// 		if (value.find(cluster => cluster.uuid === id))
	// 			return key;

	// 	return undefined;
	// }

	// function move(fromId: string, toId: string) {
	// const from = getContainerByCluster(fromId);
	// const to = getContainerByCluster(toId);

	// console.log(from, to);

	// if (from === undefined || to === undefined)
	// 	return;

	// if (from === to) {
	// 	const list = clusters();
	// 	const fromList = list[from];
	// 	const fromIndex = fromList.findIndex(cluster => cluster.uuid === fromId);
	// 	const toIndex = fromList.findIndex(cluster => cluster.uuid === toId);

	// 	if (fromIndex === toIndex)
	// 		return;

	// 	const newList = [...fromList];
	// 	const [removed] = newList.splice(fromIndex, 1);
	// 	newList.splice(toIndex, 0, removed);

	// 	mutate({ ...list, [from]: newList });
	// }
	// else {
	// 	const list = clusters();
	// 	const fromList = list[from];
	// 	const toList = list[to];
	// 	const fromIndex = fromList.findIndex(cluster => cluster.uuid === fromId);
	// 	const toIndex = toList.findIndex(cluster => cluster.uuid === toId);

	// 	const newListFrom = [...fromList];
	// 	const newListTo = [...toList];

	// 	const [removed] = newListFrom.splice(fromIndex, 1);
	// 	newListTo.splice(toIndex, 0, removed);

	// 	mutate({ ...list, [from]: newListFrom, [to]: newListTo });
	// }
	// }

	// const onDragEnd: DragEventHandler = (event) => {
	// 	if (event.draggable && event.droppable)
	// 		move(event.draggable.id as string, event.droppable.id as string);
	// };

	return (
		<div class="h-full flex flex-col gap-y-4 text-fg-primary">
			<Banner />

			<div class="flex flex-row items-center justify-between">
				<div>
					<TextField iconLeft={<SearchMdIcon />} placeholder="Search for clusters..." />
				</div>
				<div class="flex flex-row gap-x-4">
					<Button
						buttonStyle="primary"
						iconLeft={<PlusIcon class="stroke-[2.2] !w-5" />}
						children="New Cluster"
						onClick={newCluster}
					/>
				</div>
			</div>

			<Show
				when={containerIds(clusters()).length > 0}
				children={(
					// <DragDropProvider onDragEnd={onDragEnd}>
					// 	<DragDropSensors />

					<For each={Object.entries(clusters() ?? {})}>
						{([group, clusters]) => (
							<ClusterGroup title={group} clusters={clusters} />
						)}
					</For>

					// 	<DragOverlay>
					// 		{draggable => (
					// 			draggable?.node.cloneNode(true)
					// 		)}
					// 	</DragOverlay>
					// </DragDropProvider>
				)}
				fallback={(
					<div class="max-h-64 flex flex-1 flex-col items-center justify-center gap-y-4">
						<span class="text-lg text-fg-secondary font-bold uppercase">No clusters were found.</span>
						<span class="text-xl font-bold">Create one now with the New Cluster button.</span>
					</div>
				)}
			/>
		</div>
	);
}

export default HomePage;

// TODO: Replace this into it's own component
// possibly with the core ui lirbary with autogenerated and optimized svgs pls
// function _OneConfigLogo() {
// 	return (
// 		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
// 			<g id="Group 3544">
// 				<g id="Group 3545">
// 					<path id="Secondary" d="M15.635 6.4514C15.6593 6.49541 15.6848 6.54148 15.7046 6.58943C16.1185 7.45825 16.1017 8.7122 15.6275 9.56181L13.9018 12.5487C13.3915 11.7689 12.6768 11.0998 11.8176 10.5943C11.8392 10.5607 11.8585 10.5269 11.8753 10.4933C13.3988 7.41013 11.8176 3.33781 8.0003 3.39798C4.11578 3.333 2.58014 7.47994 4.17113 10.604C3.31664 11.1094 2.6067 11.7761 2.09878 12.5535C2.08691 12.5283 1.91791 12.2378 1.68616 11.8394C1.12277 10.8708 0.18813 9.26419 0.235961 9.27782C-0.0841643 8.50283 -0.0793459 7.4438 0.255235 6.67845C0.27533 6.62445 0.300245 6.57238 0.326452 6.52232C0.341024 6.49435 0.356067 6.46697 0.370757 6.44017L2.83046 2.1753C2.8341 2.17043 2.83716 2.1649 2.84021 2.15944C2.84327 2.15409 2.84621 2.1488 2.84973 2.14404C3.35754 1.29925 4.5586 0.613281 5.53813 0.613281H10.4576C11.5744 0.613281 12.607 1.21017 13.163 2.1753C13.1686 2.18241 14.024 3.66317 14.7254 4.87721C15.2115 5.7186 15.6235 6.43183 15.6275 6.43777L15.635 6.4514Z" fill="#DFEAFF" fill-opacity="0.5" />
// 					<g id="Primary">
// 						<path d="M5.73802 12.1854C7.03039 12.9171 8.98957 12.9147 10.2532 12.1806C11.3314 12.7149 12.1161 13.6247 12.3591 14.6933C11.8272 15.0856 11.1725 15.3527 10.5804 15.3816C10.542 15.3865 10.4987 15.3865 10.4601 15.3865C10.4265 15.3856 9.7571 15.386 8.9193 15.3865H8.87546C7.43983 15.3874 5.53976 15.3886 5.47807 15.3841C4.87154 15.3696 4.1904 15.1 3.64404 14.6933C3.88237 13.6271 4.66459 12.7197 5.73802 12.1854Z" fill="#DFEAFF" fill-opacity="0.5" />
// 						<path d="M10.4314 8.0023C10.5156 11.3598 5.48535 11.3574 5.56961 8.0023C5.5239 4.62553 10.4747 4.62553 10.4314 8.0023Z" fill="#DFEAFF" fill-opacity="0.5" />
// 					</g>
// 				</g>
// 			</g>
// 		</svg>
// 	);
// }

function Banner() {
	// TODO: Banner information
	/**
	 * If there are any clusters, display the most recent cluster name + some statistics as the "description".
	 * The background would prioritise
	 * any screenshots taken from the cluster, if there are none, it would display the cluster cover if it has been set.
	 * The button would launch the cluster.
	 *
	 * If there are no clusters, display a generic background with the button action creating a new cluster.
	 */
	const cluster = useRecentCluster();
	const launch = useLaunchCluster(() => cluster()?.uuid);
	const navigate = useNavigate();

	return (
		<div class="relative h-52 min-h-52 w-full overflow-hidden rounded-xl">
			<ClusterCover
				class="absolute h-52 w-full rounded-xl object-cover"
				linearBlur={{
					degrees: 270,
					blur: 30,
					class: 'after:right-1/3!',
				}}
				cluster={cluster()}
				fallback={BannerBackground}
			/>

			<div class="relative z-10 h-full flex flex-col items-start justify-between px-8 py-6 text-fg-primary">
				<div class="flex flex-col gap-y-2">
					<h1>{cluster()?.meta.name || 'Create a cluster'}</h1>
					<Show when={cluster() !== undefined}>
						<p>
							You've played
							{' '}
							<strong>
								{cluster()!.meta.mc_version}
								{' '}
								{upperFirst(cluster()!.meta.loader) || 'Unknown'}
							</strong>
							{' '}
							for
							{' '}
							<strong>{formatAsDuration((cluster()!.meta.overall_played || 0n))}</strong>
							.
						</p>
					</Show>
				</div>
				<div class="w-full flex flex-row items-end justify-between">
					<div class="flex flex-row items-center gap-x-4">
						<Show
							when={cluster() !== undefined}
							children={(
								<>
									<Button
										buttonStyle="primary"
										iconLeft={<PlayIcon />}
										children={`Launch ${cluster()!.meta.mc_version}`}
										onClick={launch}
									/>
									<Button
										buttonStyle="iconSecondary"
										class="bg-op-10!"
										children={<DotsVerticalIcon />}
										onClick={() => ClusterRoot.open(navigate, cluster()!.uuid)}
									/>
								</>
							)}
						/>
					</div>
					<div class="flex flex-row gap-x-2">
						{/* TODO: These tags */}
						{/* <Tag iconLeft={<OneConfigLogo />} />
						<Tag iconLeft={<CheckIcon />}>Verified</Tag> */}
					</div>
				</div>
			</div>
		</div>
	);
}

function ClusterCard(props: Cluster) {
	const navigate = useNavigate();
	// const sortable = createSortable(props.uuid, props);
	let ref!: HTMLDivElement;

	function openClusterPage(_e: MouseEvent) {
		navigate(`/clusters/?id=${props.uuid}`);
	}

	const launch = useLaunchCluster(() => props.uuid);

	return (
		<>
			<div
				onClick={e => openClusterPage(e)}
				ref={mergeRefs(
					ref,
					// sortable
				)}
				class="group relative h-[152px] flex flex-col border border-gray-05 rounded-xl bg-component-bg active:bg-component-bg-pressed hover:bg-component-bg-hover"
			>
				<div class="relative flex-1 overflow-hidden rounded-t-xl">
					<div
						class="absolute h-full w-full transition-transform group-hover:!scale-110"
						style={{ '-webkit-transform': 'translateZ(0)' }}
					>
						<ClusterCover
							cluster={props}
							class="h-full w-full object-cover"
						/>
					</div>
				</div>
				<div class="z-10 flex flex-row items-center justify-between gap-x-3 p-3">
					<div class="h-8 flex flex-col gap-1.5 overflow-hidden">
						<p class="h-4 text-ellipsis whitespace-nowrap font-medium">{props.meta.name}</p>
						<p class="h-4 text-xs">
							{upperFirst(props.meta.loader)}
							{' '}
							{props.meta.mc_version}
							{/* {' '}
							{props.instance.mods && `• ${props.mods} mods`} */}
						</p>
					</div>
					<Button
						buttonStyle="iconSecondary"
						onClick={(e) => {
							e.preventDefault();
							e.stopImmediatePropagation();
							launch();
						}}
					>
						<PlayIcon class="h-4! w-4!" />
					</Button>
				</div>
			</div>
		</>
	);
}

interface ClusterGroupProps {
	title: string;
	clusters: Cluster[];
}

function ClusterGroup(props: ClusterGroupProps) {
	// const droppable = createDroppable(props.title);
	// const ids = createMemo(() => props.clusters.map(cluster => cluster.uuid));

	return (
		<div
			// ref={droppable}
			class="flex flex-col gap-y-4"
		>
			<h4>{props.title}</h4>
			<div class="grid grid-cols-4 min-h-38 gap-4 2xl:grid-cols-6">
				{/* <SortableProvider ids={ids()}> */}
				<For each={props.clusters}>{item => <ClusterCard {...item} />}</For>
				{/* </SortableProvider> */}
			</div>
		</div>
	);
}
