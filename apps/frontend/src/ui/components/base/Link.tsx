import { type JSX, splitProps } from 'solid-js';
import { LinkExternal01Icon } from '@untitled-theme/icons-solid';
import styles from './Link.module.scss';
import usePromptOpener from '~ui/hooks/usePromptOpener';

export type LinkProps = JSX.IntrinsicElements['a'] & {
	prompt?: boolean;
	includeIcon?: boolean;
};

function Link(props: LinkProps) {
	const [split, rest] = splitProps(props, ['prompt', 'class', 'href', 'onClick', 'children']);
	const open = usePromptOpener();

	function onClick() {
		open(split.href, !!split.prompt);

		// @ts-expect-error -- This should be valid
		props.onClick?.();
	}

	return (
		<button
			{...rest as any}
			class={`${styles.link} ${split.class || ''}`}
			onClick={onClick}
			children={(
				<div class="flex flex-row gap-x-1">
					{props.children}
					{props.includeIcon === true && (
						<LinkExternal01Icon class="h-3 min-h-3 min-w-3 w-3" />
					)}
				</div>
			)}
		/>
	);
}

export default Link;
