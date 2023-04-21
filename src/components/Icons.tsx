import { createIcon, IconProps } from "@chakra-ui/icons";

const defaultProps: IconProps = { fontSize: "1.2em" };

export const LightningIcon = createIcon({
  displayName: "LightningIcon",
  d: "M13 10h7l-9 13v-9H4l9-13z",
  defaultProps,
});

export const ClipboardIcon = createIcon({
  displayName: "ClipboardIcon",
  d: "M7 4V2h10v2h3.007c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 21.007V4.993C3 4.445 3.445 4 3.993 4H7zm0 2H5v14h14V6h-2v2H7V6zm2-2v2h6V4H9z",
  defaultProps,
});

export const CheckIcon = createIcon({
  displayName: "CheckIcon",
  d: "M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",
  defaultProps,
});
