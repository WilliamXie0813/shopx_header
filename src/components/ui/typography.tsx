import * as React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Pencil, X } from "lucide-react";
import { Input } from "./input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

export interface TitleProps {
	level?: 1 | 2 | 3 | 4 | 5;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

type TitleLevel = NonNullable<TitleProps["level"]>;
type HeadingTag = `h${TitleLevel}`;

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
	({ level = 1, children, className, style }, ref) => {
		const Tag = `h${level}` as HeadingTag;
		const sizeClasses: Record<TitleLevel, string> = {
			1: "text-5xl font-medium tracking-tight",
			2: "text-2xl font-medium leading-tight tracking-tight",
			3: "text-xl font-medium",
			4: "text-lg font-medium",
			5: "text-base font-medium",
		};
		return (
			<Tag
				ref={ref as React.Ref<HTMLHeadingElement>}
				className={cn(sizeClasses[level], className)}
				style={style}
			>
				{children}
			</Tag>
		);
	},
);
Title.displayName = "Title";

// ============================== Types ==============================

export interface CopyConfig {
	text?: string;
	icon?: React.ReactNode;
	tooltips?: [React.ReactNode, React.ReactNode];
	onCopy?: () => void;
	onCopyError?: (error: unknown) => void;
}

export interface EditConfig {
	editing?: boolean;
	icon?: React.ReactNode;
	tooltip?: React.ReactNode;
	onStart?: () => void;
	onChange?: (value: string) => void;
	onEnd?: () => void;
	onCancel?: () => void;
	maxLength?: number;
}

export interface EllipsisConfig {
	rows?: number;
	expandable?: boolean;
	suffix?: string;
	symbol?: React.ReactNode;
	onExpand?: () => void;
	onEllipsis?: () => void;
}

interface BaseTypographyProps {
	type?: "secondary" | "success" | "warning" | "danger" | "muted";
	mark?: boolean;
	code?: boolean;
	keyboard?: boolean;
	underline?: boolean;
	delete?: boolean;
	strong?: boolean;
	italic?: boolean;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

function getLineClampStyle(rows: number): React.CSSProperties {
	return {
		display: "-webkit-box",
		WebkitBoxOrient: "vertical",
		WebkitLineClamp: String(Math.max(1, Math.floor(rows))),
		overflow: "hidden",
	};
}

function getSafeHref(href: string) {
	const trimmedHref = href.trim();

	if (!trimmedHref) return "#";

	try {
		const url = new URL(trimmedHref, "https://example.com");
		const safeProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

		return safeProtocols.has(url.protocol) ? href : "#";
	} catch {
		return "#";
	}
}

function getSafeRel(target?: string, rel?: string) {
	if (target !== "_blank") return rel;

	const relParts = new Set((rel ?? "").split(/\s+/).filter(Boolean));
	relParts.add("noopener");
	relParts.add("noreferrer");

	return Array.from(relParts).join(" ");
}

// ============================== BaseTypography ==============================

function BaseTypography({
	type,
	mark,
	code,
	keyboard,
	underline,
	delete: del,
	strong,
	italic,
	children,
	className,
	style,
}: BaseTypographyProps) {
	let content: React.ReactNode = children;

	if (italic) content = <em>{content}</em>;
	if (strong) content = <strong>{content}</strong>;
	if (del) content = <del>{content}</del>;
	if (underline) content = <u>{content}</u>;
	if (keyboard) {
		content = (
			<kbd className="font-mono text-xs border rounded px-1.5 py-0.5 shadow-sm">
				{content}
			</kbd>
		);
	} else if (code) {
		content = (
			<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
				{content}
			</code>
		);
	}
	if (mark) {
		content = (
			<mark className="bg-yellow-200/50 px-1 rounded text-inherit">
				{content}
			</mark>
		);
	}

	return (
		<span
			className={cn(
				type &&
					{
						secondary: "text-muted-foreground",
						success: "text-green-600",
						warning: "text-amber-500",
						danger: "text-red-500",
						muted: "text-gray-400",
					}[type],
				className,
			)}
			style={style}
		>
			{content}
		</span>
	);
}

// ============================== Copyable ==============================

function CopyableAction({
	text,
	config,
}: {
	text: string;
	config?: CopyConfig | boolean;
}) {
	const [copied, setCopied] = React.useState(false);
	const resetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const resolvedConfig = typeof config === "boolean" ? {} : config || {};

	React.useEffect(() => {
		return () => {
			if (resetTimerRef.current) {
				clearTimeout(resetTimerRef.current);
			}
		};
	}, []);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(resolvedConfig.text || text);
			setCopied(true);
			resolvedConfig.onCopy?.();
			if (resetTimerRef.current) {
				clearTimeout(resetTimerRef.current);
			}
			resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			resolvedConfig.onCopyError?.(error);
		}
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={handleCopy}
						className="inline-flex items-center ml-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
						aria-label={copied ? "已复制" : "复制"}
					>
						{copied ? (
							<Check className="h-3.5 w-3.5 text-green-600" />
						) : (
							resolvedConfig.icon || <Copy className="h-3.5 w-3.5" />
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent>
					{copied
						? (resolvedConfig.tooltips?.[1] ?? "已复制")
						: (resolvedConfig.tooltips?.[0] ?? "复制")}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

// ============================== Editable ==============================

function EditableAction({
	value,
	config,
	onSave,
	renderValue,
}: {
	value: string;
	config?: EditConfig | boolean;
	onSave?: (value: string) => void;
	renderValue?: (value: string) => React.ReactNode;
}) {
	const resolvedConfig = typeof config === "boolean" ? {} : config || {};
	const isControlled = resolvedConfig.editing !== undefined;
	const [uncontrolledEditing, setUncontrolledEditing] = React.useState(false);
	const [currentValue, setCurrentValue] = React.useState(value);
	const [editValue, setEditValue] = React.useState(value);
	const isEditing = isControlled
		? Boolean(resolvedConfig.editing)
		: uncontrolledEditing;

	const handleStart = () => {
		setEditValue(currentValue);
		if (!isControlled) setUncontrolledEditing(true);
		resolvedConfig.onStart?.();
	};

	const handleConfirm = () => {
		setCurrentValue(editValue);
		onSave?.(editValue);
		if (!isControlled) setUncontrolledEditing(false);
		resolvedConfig.onEnd?.();
	};

	const handleCancel = () => {
		setEditValue(currentValue);
		if (!isControlled) setUncontrolledEditing(false);
		resolvedConfig.onCancel?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleConfirm();
		if (e.key === "Escape") handleCancel();
	};

	if (isEditing) {
		return (
			<span className="inline-flex items-center gap-1">
				<Input
					value={editValue}
					onChange={(e) => {
						setEditValue(e.target.value);
						resolvedConfig.onChange?.(e.target.value);
					}}
					onKeyDown={handleKeyDown}
					maxLength={resolvedConfig.maxLength}
					className="h-6 min-w-[120px] inline-flex w-auto py-0 px-1.5 text-sm"
					autoFocus
				/>
				<button
					type="button"
					onClick={handleConfirm}
					className="inline-flex items-center cursor-pointer"
					aria-label="确认"
				>
					<Check className="h-3.5 w-3.5 text-green-600" />
				</button>
				<button
					type="button"
					onClick={handleCancel}
					className="inline-flex items-center cursor-pointer"
					aria-label="取消"
				>
					<X className="h-3.5 w-3.5 text-red-500" />
				</button>
			</span>
		);
	}

	return (
		<>
			{renderValue ? renderValue(currentValue) : <span>{currentValue}</span>}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleStart}
							className="inline-flex items-center ml-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
							aria-label="编辑"
						>
							{resolvedConfig.icon || <Pencil className="h-3.5 w-3.5" />}
						</button>
					</TooltipTrigger>
					<TooltipContent>{resolvedConfig.tooltip || "编辑"}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</>
	);
}

// ============================== Ellipsis ==============================

function EllipsisWrapper({
	config,
	children,
}: {
	config?: EllipsisConfig | boolean;
	children: React.ReactNode;
}) {
	const resolvedConfig = typeof config === "boolean" ? {} : config || {};
	const rows = resolvedConfig.rows || 1;
	const [expanded, setExpanded] = React.useState(false);
	const isClamped = !expanded;
	const { onEllipsis } = resolvedConfig;

	React.useEffect(() => {
		if (isClamped) {
			onEllipsis?.();
		}
	}, [isClamped, onEllipsis]);

	if (expanded) {
		return (
			<>
				{children}
				{resolvedConfig.expandable && (
					<button
						type="button"
						onClick={() => setExpanded(false)}
						className="inline-flex items-center ml-1 text-primary cursor-pointer hover:underline"
					>
						{resolvedConfig.symbol || "收起"}
					</button>
				)}
			</>
		);
	}

	return (
		<span className="inline-flex flex-wrap items-center">
			<span style={resolvedConfig.expandable ? getLineClampStyle(rows) : undefined}>
				{children}
				{resolvedConfig.suffix && <span>{resolvedConfig.suffix}</span>}
			</span>
			{resolvedConfig.expandable && (
				<button
					type="button"
					onClick={() => {
						setExpanded(true);
						resolvedConfig.onExpand?.();
					}}
					className="inline-flex items-center ml-1 text-primary cursor-pointer hover:underline shrink-0"
				>
					{resolvedConfig.symbol || "展开"}
				</button>
			)}
		</span>
	);
}

// ============================== Text ==============================

export interface TextProps extends BaseTypographyProps {
	copyable?: boolean | CopyConfig;
	editable?: boolean | EditConfig;
	ellipsis?: boolean | EllipsisConfig;
}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
	({ className, copyable, editable, ellipsis, children, ...props }, ref) => {
		const textString = typeof children === "string" ? children : "";
		const resolvedEllipsis =
			typeof ellipsis === "boolean" ? {} : ellipsis || {};
		const rows = resolvedEllipsis.rows || 1;

		if (editable) {
			return (
				<span
					ref={ref}
					className={cn("group inline-flex items-center", className)}
				>
					<EditableAction
						key={textString}
						value={textString}
						config={editable}
					/>
				</span>
			);
		}

		const content = (
			<BaseTypography
				{...props}
				className={className}
				style={
					ellipsis && !resolvedEllipsis.expandable
						? getLineClampStyle(rows)
						: undefined
				}
			>
				{children}
			</BaseTypography>
		);

		return (
			<span ref={ref} className="group inline-flex items-center">
				{ellipsis ? (
					<EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
				) : (
					content
				)}
				{copyable && textString && (
					<CopyableAction text={textString} config={copyable} />
				)}
			</span>
		);
	},
);
Text.displayName = "Text";

// ============================== Paragraph ==============================

export interface ParagraphProps extends BaseTypographyProps {
	copyable?: boolean | CopyConfig;
	editable?: boolean | EditConfig;
	ellipsis?: boolean | EllipsisConfig;
}

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
	({ className, copyable, editable, ellipsis, children, ...props }, ref) => {
		const textString = typeof children === "string" ? children : "";
		const resolvedEllipsis =
			typeof ellipsis === "boolean" ? {} : ellipsis || {};
		const rows = resolvedEllipsis.rows || 1;

		if (editable) {
			return (
				<p ref={ref} className={cn("leading-relaxed mb-4", className)}>
					<EditableAction
						key={textString}
						value={textString}
						config={editable}
					/>
				</p>
			);
		}

		const content = (
			<BaseTypography
				{...props}
				style={
					ellipsis && !resolvedEllipsis.expandable
						? getLineClampStyle(rows)
						: undefined
				}
			>
				{children}
			</BaseTypography>
		);

		return (
			<p ref={ref} className={cn("leading-relaxed mb-4 group", className)}>
				{ellipsis ? (
					<EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
				) : (
					content
				)}
				{copyable && textString && (
					<CopyableAction text={textString} config={copyable} />
				)}
			</p>
		);
	},
);
Paragraph.displayName = "Paragraph";

// ============================== Link ==============================

export interface LinkProps extends BaseTypographyProps {
	href: string;
	target?: string;
	rel?: string;
	copyable?: boolean | CopyConfig;
	editable?: boolean | EditConfig;
	ellipsis?: boolean | EllipsisConfig;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			href,
			target,
			rel,
			className,
			copyable,
			editable,
			ellipsis,
			children,
			...props
		},
		ref,
	) => {
		const textString = typeof children === "string" ? children : "";
		const resolvedEllipsis =
			typeof ellipsis === "boolean" ? {} : ellipsis || {};
		const rows = resolvedEllipsis.rows || 1;
		const safeHref = getSafeHref(href);
		const safeRel = getSafeRel(target, rel);

		if (editable) {
			return (
				<span
					className="group inline-flex items-center"
				>
					<EditableAction
						key={textString}
						value={textString}
						config={editable}
						renderValue={(value) => (
							<a
								ref={ref}
								href={safeHref}
								target={target}
								rel={safeRel}
								className={cn(
									"text-primary hover:underline cursor-pointer",
									className,
								)}
							>
								<BaseTypography {...props}>{value}</BaseTypography>
							</a>
						)}
					/>
				</span>
			);
		}

		const content = (
			<a
				ref={ref}
				href={safeHref}
				target={target}
				rel={safeRel}
				className={cn("text-primary hover:underline cursor-pointer", className)}
			>
				<BaseTypography
					{...props}
					style={
						ellipsis && !resolvedEllipsis.expandable
							? getLineClampStyle(rows)
							: undefined
					}
				>
					{children}
				</BaseTypography>
			</a>
		);

		if (ellipsis) {
			return (
				<span className="group inline-flex items-center">
					<EllipsisWrapper config={ellipsis}>{content}</EllipsisWrapper>
					{copyable && textString && (
						<CopyableAction text={textString} config={copyable} />
					)}
				</span>
			);
		}

		return (
			<span className="group inline-flex items-center">
				{content}
				{copyable && textString && (
					<CopyableAction text={textString} config={copyable} />
				)}
			</span>
		);
	},
);
Link.displayName = "Link";

// ============================== Aggregate Export ==============================

// eslint-disable-next-line react-refresh/only-export-components
export const Typography = {
	Title,
	Text,
	Paragraph,
	Link,
};
