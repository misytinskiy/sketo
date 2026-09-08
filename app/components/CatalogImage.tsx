"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// Remember the failing URL so switching gallery images can recover immediately.
export default function CatalogImage(props: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const failed = !props.src || failedSrc === props.src;
  return <Image {...props} alt={props.alt} src={failed ? "/image-unavailable.svg" : props.src}
    unoptimized={failed || props.unoptimized}
    onError={(event) => { if (!failed) setFailedSrc(props.src); props.onError?.(event); }} />;
}
