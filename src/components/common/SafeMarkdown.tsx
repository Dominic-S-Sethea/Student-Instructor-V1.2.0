import React from 'react';
import Markdown, { type Components } from 'react-markdown';
import { getSafeHttpUrl } from '../../utils/safeUrl';

interface SafeMarkdownProps {
  children: string;
  components?: Components;
}

const DEFAULT_SAFE_COMPONENTS: Components = {
  a: ({ href, children, ...props }) => {
    const safeHref = getSafeHttpUrl(href);
    if (!safeHref) {
      return <span className="underline decoration-dotted text-slate-600 dark:text-slate-300">{children}</span>;
    }
    return (
      <a
        {...props}
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
      >
        {children}
      </a>
    );
  },
  // Block untrusted external images / tracking pixels from AI or user-generated markdown
  img: () => null,
};

/**
 * Renders markdown content with allowlisted HTTP(S)-only links (`rel="noopener noreferrer"`)
 * and disabled arbitrary image embeds to prevent protocol injection and tracking beacons.
 */
export const SafeMarkdown: React.FC<SafeMarkdownProps> = React.memo(({ children, components }) => {
  const mergedComponents: Components = components
    ? { ...components, a: DEFAULT_SAFE_COMPONENTS.a, img: DEFAULT_SAFE_COMPONENTS.img }
    : DEFAULT_SAFE_COMPONENTS;

  return <Markdown components={mergedComponents}>{children}</Markdown>;
});

SafeMarkdown.displayName = 'SafeMarkdown';
