import { Latex } from "@/components/math/latex"

interface Block {
  type: string
  content?: string
  math?: string
}

export default function LessonRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-5 sm:space-y-6 lg:space-y-7 text-[15px] leading-7 sm:text-[16px] sm:leading-8 lg:text-[17px]">
        {blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <p
                key={i}
                className="text-zinc-300 break-words"
              >
                {block.content}
              </p>
            )
          }

          if (block.type === "formula") {
            return (
              <div
                key={i}
                className="my-5 overflow-x-auto rounded-xl sm:rounded-2xl px-2 py-3 sm:px-4 sm:py-4"
              >
                <div className="flex min-w-max justify-center">
                  <Latex math={block.math ?? ""} />
                </div>
              </div>
            )
          }

          if (block.type === "example") {
            return (
              <div
                key={i}
                className="border-l-2 border-zinc-700 pl-3 sm:pl-4 text-zinc-200"
              >
                <span className="font-semibold text-blue-400">
                  Exemple :
                </span>{" "}
                <span className="break-words">{block.content}</span>
              </div>
            )
          }

          if (block.type === "tip") {
            return (
              <div
                key={i}
                className="text-zinc-400 italic break-words"
              >
                💡 {block.content}
              </div>
            )
          }

          if (block.type === "definition") {
            return (
              <div
                key={i}
                className="text-zinc-100 font-semibold break-words"
              >
                {block.content}
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}