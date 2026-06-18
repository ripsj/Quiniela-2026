interface Props {
  text: string;
}

export default function StatTooltip({
  text,
}: Props) {
  return (
    <div className="group relative">

      <button
        className="
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          bg-slate-100
          text-xs
          font-bold
          text-slate-500
          transition
          hover:bg-slate-200
        "
      >
        ?
      </button>

      <div
        className="
          invisible
          absolute
          right-0
          top-8
          z-50
          w-64
          rounded-xl
          bg-slate-900
          p-3
          text-xs
          leading-relaxed
          text-white
          shadow-xl
          opacity-0
          transition-all
          group-hover:visible
          group-hover:opacity-100
        "
      >
        {text}
      </div>

    </div>
  );
}