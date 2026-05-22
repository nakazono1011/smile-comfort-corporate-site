import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
}: FigureProps) {
  return (
    <figure className="not-prose my-10">
      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, 1112px"
          className="h-auto w-full object-cover"
          unoptimized
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-slate-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
