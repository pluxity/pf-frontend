import {
  Combobox as HeadlessCombobox,
  ComboboxButton as HeadlessComboboxButton,
  ComboboxOption as HeadlessComboboxOption,
  ComboboxOptions as HeadlessComboboxOptions,
  Transition,
} from "@headlessui/react";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type JSX,
  type ReactElement,
  type ReactNode,
} from "react";
import { Check, ChevronDownSmall, Loader } from "../../atoms/Icon";
import { cn } from "../../utils";
import type {
  ComboBoxContentProps,
  ComboBoxEmptyProps,
  ComboBoxIconProps,
  ComboBoxInputProps,
  ComboBoxItemIconProps,
  ComboBoxItemProps,
  ComboBoxListProps,
  ComboBoxLoadingProps,
  ComboBoxProps,
  ComboBoxSeparatorProps,
  ComboBoxTriggerProps,
  EnsureArray,
  ComboBoxValueType,
  ComboBoxValueProps,
  ComboBoxFilterFn,
  ComboBoxGroupProps,
} from "./types";

interface ComboBoxContextValue<TValue, TMultiple extends boolean | undefined> {
  value: ComboBoxValueType<TValue, TMultiple>;
  multiple?: TMultiple;
  open: boolean;
  query: string;
  setQuery: (value: string) => void;
  filter: ComboBoxFilterFn<TValue>;
  matchCount: number;
  setMatchCount: (count: number) => void;
  renderValue?: (value: ComboBoxValueType<TValue, TMultiple>) => React.ReactNode;
  isLoading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComboBoxContext = createContext<ComboBoxContextValue<any, boolean | undefined> | null>(null);

function useComboBoxContext<TValue, TMultiple extends boolean | undefined = boolean | undefined>() {
  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBox components must be used within a ComboBox root.");
  }
  return context as ComboBoxContextValue<TValue, TMultiple>;
}

const defaultFilter: ComboBoxFilterFn<unknown> = (query, textValue) => {
  if (!query) return true;
  return textValue.toLowerCase().includes(query.toLowerCase());
};

type HeadlessValue<TValue, TMultiple extends boolean | undefined> = TMultiple extends true
  ? EnsureArray<TValue>
  : TValue | undefined;

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join(" ");
  }
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return "";
}

function ComboBoxRoot<TValue, TMultiple extends boolean | undefined = false>({
  children,
  value,
  onValueChange,
  multiple,
  by,
  className,
  renderValue,
  filter = defaultFilter,
  isLoading,
  disabled,
  ...props
}: ComboBoxProps<TValue, TMultiple>) {
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const handleChange = (val: unknown) => {
    setQuery("");
    (onValueChange as ((value: ComboBoxValueType<TValue, TMultiple>) => void) | undefined)?.(
      val as ComboBoxValueType<TValue, TMultiple>
    );
  };

  const providerValue = useMemo(
    () => ({
      value,
      multiple,
      query,
      setQuery,
      filter: filter as ComboBoxFilterFn<TValue>,
      matchCount,
      setMatchCount,
      renderValue,
      isLoading,
      open: false, // placeholder, overwritten in render prop below
    }),
    [filter, isLoading, matchCount, multiple, query, renderValue, value]
  );

  const headlessValue = (
    multiple
      ? (value as EnsureArray<TValue> | undefined)
      : ((value ?? undefined) as TValue | undefined)
  ) as HeadlessValue<TValue, TMultiple>;

  const headlessBy: ((a: TValue, b: TValue) => boolean) | undefined =
    typeof by === "string"
      ? (a: TValue, b: TValue) =>
          (a as Record<string, unknown>)[by] === (b as Record<string, unknown>)[by]
      : by;

  return (
    <HeadlessCombobox
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={headlessValue as any}
      onChange={handleChange}
      multiple={multiple}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      by={headlessBy as any}
      disabled={disabled}
      {...props}
    >
      {({ open }) => (
        <ComboBoxContext.Provider value={{ ...providerValue, open }}>
          <div className={cn("relative w-full", className)}>{children}</div>
        </ComboBoxContext.Provider>
      )}
    </HeadlessCombobox>
  );
}

function ComboBoxTrigger({ className, children, ...props }: ComboBoxTriggerProps) {
  return (
    <HeadlessComboboxButton
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm",
        "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </HeadlessComboboxButton>
  );
}

function ComboBoxValueComponent<TValue>({
  placeholder = "Select...",
  className,
  maxVisible = 3,
  ...props
}: ComboBoxValueProps) {
  const { value, renderValue } = useComboBoxContext<TValue>();
  const isEmpty = value === null || (Array.isArray(value) && value.length === 0);
  const isArrayValue = Array.isArray(value);

  const defaultRenderValue = () => {
    if (Array.isArray(value)) {
      const visible = value.slice(0, maxVisible).map((item) => (item === null ? "" : String(item)));
      const remaining = value.length - maxVisible;
      return (
        <>
          {visible.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs text-primary-700"
            >
              {item}
            </span>
          ))}
          {remaining > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              +{remaining} more
            </span>
          ) : null}
        </>
      );
    }
    if (value === null) return "";
    return String(value);
  };

  const rendered = renderValue ? renderValue(value) : defaultRenderValue();

  return (
    <span
      className={cn(
        "flex-1 text-left",
        isArrayValue && "flex flex-wrap items-center gap-1",
        isEmpty ? "text-gray-500" : "text-gray-900",
        className
      )}
      {...props}
    >
      {isEmpty ? placeholder : rendered}
    </span>
  );
}

function ComboBoxIcon({ className, ...props }: ComboBoxIconProps) {
  return (
    <span className={cn("ml-2 text-gray-500", className)} aria-hidden="true" {...props}>
      <ChevronDownSmall />
    </span>
  );
}

function ComboBoxContent({ className, children }: ComboBoxContentProps) {
  const { open } = useComboBoxContext<unknown>();

  return (
    <Transition
      show={open}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 translate-y-1 scale-95"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 translate-y-1 scale-95"
    >
      <div
        className={cn(
          "absolute left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg",
          "focus:outline-none",
          className
        )}
      >
        {children}
      </div>
    </Transition>
  );
}

function ComboBoxInput({
  className,
  onChange,
  placeholder = "Type to search...",
  ...props
}: ComboBoxInputProps) {
  const { setQuery, query } = useComboBoxContext<unknown>();

  return (
    <div className="p-2">
      <HeadlessCombobox.Input
        className={cn(
          "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
          className
        )}
        placeholder={placeholder}
        displayValue={() => query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange?.(event);
        }}
        {...props}
      />
    </div>
  );
}

function ComboBoxGroup({ label, className, children, ...props }: ComboBoxGroupProps) {
  return (
    <div className={cn("px-1 py-1.5", className)} role="group" {...props}>
      {label ? <div className="px-2 pb-1 text-xs font-semibold text-gray-500">{label}</div> : null}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ComboBoxItem<TValue>({
  value,
  className,
  children,
  disabled,
  ...props
}: ComboBoxItemProps<TValue>) {
  return (
    <HeadlessComboboxOption
      value={value}
      disabled={disabled}
      as="li"
      className={({ focus, disabled: optionDisabled, selected }) =>
        cn(
          "flex w-full cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm",
          focus && "bg-gray-50",
          selected && "text-primary-600",
          (disabled || optionDisabled) && "cursor-not-allowed opacity-50",
          className
        )
      }
      {...props}
    >
      {({ selected }) => (
        <>
          <span className="flex min-w-0 items-center gap-2 text-gray-900">{children}</span>
          {selected ? <Check size="sm" className="ml-auto text-primary-500" /> : null}
        </>
      )}
    </HeadlessComboboxOption>
  );
}

function ComboBoxItemIcon({ className, ...props }: ComboBoxItemIconProps) {
  return (
    <span
      className={cn("flex h-4 w-4 items-center justify-center text-gray-500", className)}
      {...props}
    />
  );
}

function ComboBoxSeparator({ className, ...props }: ComboBoxSeparatorProps) {
  return (
    <div className={cn("my-1 border-t border-gray-200", className)} role="separator" {...props} />
  );
}

function ComboBoxEmpty({ className, children = "No results found", ...props }: ComboBoxEmptyProps) {
  const { matchCount, isLoading } = useComboBoxContext<unknown>();
  if (isLoading || matchCount !== 0) return null;

  return (
    <div
      className={cn(
        "px-3 py-2 text-sm text-gray-500",
        "flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ComboBoxLoading({ className, children, label = "Loading..." }: ComboBoxLoadingProps) {
  const { isLoading } = useComboBoxContext<unknown>();
  if (!isLoading) return null;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 text-sm text-gray-500", className)}>
      <Loader size="sm" className="animate-spin text-gray-400" />
      <span>{children ?? label}</span>
    </div>
  );
}

function filterListChildren<TValue>(
  children: ReactNode,
  filter: ComboBoxFilterFn<TValue>,
  query: string
): {
  filtered: ReactNode[];
  matchCount: number;
  empties: ReactElement<unknown>[];
  loadings: ReactElement<unknown>[];
} {
  const filtered: ReactNode[] = [];
  const empties: ReactElement<unknown>[] = [];
  const loadings: ReactElement<unknown>[] = [];
  let matchCount = 0;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      filtered.push(child);
      return;
    }
    const element = child as React.ReactElement<{
      children?: ReactNode;
      value?: TValue;
      textValue?: string;
    }>;

    if (element.type === ComboBoxEmpty) {
      empties.push(element as ReactElement<unknown>);
      return;
    }

    if (element.type === ComboBoxLoading) {
      loadings.push(element as ReactElement<unknown>);
      return;
    }

    if (element.type === ComboBoxGroup) {
      const result = filterListChildren(element.props.children, filter, query);
      matchCount += result.matchCount;
      if (result.filtered.length > 0) {
        filtered.push(React.cloneElement(element, {}, result.filtered));
      }
      empties.push(...result.empties);
      loadings.push(...result.loadings);
      return;
    }

    if (element.type === ComboBoxItem) {
      const itemProps = element.props as ComboBoxItemProps<TValue>;
      const textValue =
        itemProps.textValue ?? getTextContent(itemProps.children) ?? String(itemProps.value ?? "");
      const matched = filter(query, textValue, itemProps);
      if (matched) {
        matchCount += 1;
        filtered.push(element);
      }
      return;
    }

    filtered.push(element);
  });

  return { filtered, matchCount, empties, loadings };
}

function ComboBoxList<TValue>({ className, children, ...props }: ComboBoxListProps) {
  const { filter, query, setMatchCount, isLoading } = useComboBoxContext<TValue>();

  const {
    filtered,
    matchCount: nextMatchCount,
    empties,
    loadings,
  } = useMemo(() => filterListChildren(children, filter, query), [children, filter, query]);

  React.useEffect(() => {
    setMatchCount(nextMatchCount);
  }, [nextMatchCount, setMatchCount]);

  const showEmpty = !isLoading && nextMatchCount === 0;

  return (
    <HeadlessComboboxOptions
      static
      as="div"
      className={cn("max-h-64 w-full overflow-auto p-1 focus:outline-none", className)}
      {...props}
    >
      {isLoading ? loadings.length > 0 ? loadings : <ComboBoxLoading /> : filtered}
      {showEmpty ? empties.length > 0 ? empties : <ComboBoxEmpty /> : null}
    </HeadlessComboboxOptions>
  );
}

const ComboBox = ComboBoxRoot as <TValue, TMultiple extends boolean | undefined = false>(
  props: ComboBoxProps<TValue, TMultiple>
) => JSX.Element;
const ComboBoxValue = ComboBoxValueComponent;

export {
  ComboBox,
  ComboBoxTrigger,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxList,
  ComboBoxGroup,
  ComboBoxItem,
  ComboBoxItemIcon,
  ComboBoxSeparator,
  ComboBoxEmpty,
  ComboBoxLoading,
  ComboBoxValue,
  ComboBoxIcon,
};
