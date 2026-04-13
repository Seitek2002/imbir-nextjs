import { FC } from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";

import { UserCircleIcon } from "@/shared/assets";

type Props = {
  image?: StaticImageData | string;
  name: string;
  sizes?: string;
  fallbackSize?: string;
};

export const DoctorPhoto: FC<Props> = ({
  image,
  name,
  sizes = "220px",
  fallbackSize = "size-16",
}) => (
  <div className="rounded-2xl overflow-hidden bg-[#FFF8F5] absolute inset-0">
    {image ? (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <UserCircleIcon className={`${fallbackSize} text-[#C4C8CA]`} />
      </div>
    )}
  </div>
);
