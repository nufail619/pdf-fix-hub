import ReactMarkdown from "react-markdown";

export function ArticleBody({ body }: { body: string }) {
  return (
    <div className="mt-8 min-w-0 space-y-5 text-lg leading-relaxed text-foreground [overflow-wrap:anywhere] [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_pre]:max-w-full [&_pre]:overflow-x-auto">
      <ReactMarkdown
        skipHtml
        components={{
          img: (props) => <img {...props} loading="lazy" decoding="async" />,
          table: (props) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
