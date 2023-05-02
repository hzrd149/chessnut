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

export const QrCodeIcon = createIcon({
  displayName: "QrCodeIcon",
  d: "M16 17v-1h-3v-3h3v2h2v2h-1v2h-2v2h-2v-3h2v-1h1zm5 4h-4v-2h2v-2h2v4zM3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM6 6h2v2H6V6zm0 10h2v2H6v-2zM16 6h2v2h-2V6z",
  defaultProps,
});

export const CheckInCircle = createIcon({
  displayName: "CheckInCircleIcon",
  d: "M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11.0026 16L6.75999 11.7574L8.17421 10.3431L11.0026 13.1716L16.6595 7.51472L18.0737 8.92893L11.0026 16Z",
  defaultProps,
});
