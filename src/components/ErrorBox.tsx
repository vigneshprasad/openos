import Image from "next/image";

interface IProps {
  title: string;
  description: string;
}

export const ErrorBox: React.FC<IProps> = ({title, description}) => {
  return (
    <div className="mt-4 p-4 bg-white rounded-md">
      <p className="text-xs text-[#B2B0B0]">
        {title}
      </p>
      <div className="mt-4 flex gap-1 items-center">
        <Image src="/svg/incorrect.svg" alt="Incorrect" width={16} height={16} />
        <p className="text-xs text-[#E78933]">
          {description.toString()}
        </p>
      </div>
    </div>
  )
}