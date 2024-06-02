import { ColorsIcon, PaintPourIcon, Speedometer04Icon } from '@untitled-theme/icons-solid';
import SettingsRow from '../components';
import ScrollableContainer from '~ui/components/ScrollableContainer';
import Button from '~ui/components/base/Button';
import Toggle from '~ui/components/base/Toggle';
import appSettings from '~ui/state/appSettings';
import Sidebar from '~ui/components/Sidebar';

function SettingsAppearance() {
	const { settings, setSettings } = appSettings;

	return (
		<Sidebar.Page>
			<h1>Appearance</h1>
			<ScrollableContainer>
				<div class="flex flex-row items-center flex-1">
					<p>theme placeholder</p>
				</div>

				<SettingsRow
					title="Accent Color"
					description="The main color used across the launcher. This doesn't edit your theme."
					icon={<PaintPourIcon />}
				>
					<Button iconLeft={<ColorsIcon />}>#ff0000</Button>
				</SettingsRow>

				<SettingsRow
					title="Animations"
					description="Toggle all animations in the launcher."
					icon={<Speedometer04Icon />}
				>
					<Toggle
						defaultChecked={settings.reducedMotion}
						onChecked={(checked) => {
							setSettings('reducedMotion', checked);
						}}
					/>
				</SettingsRow>
			</ScrollableContainer>
		</Sidebar.Page>
	);
}

export default SettingsAppearance;