export class MarkdownFormatter {
  format(markdown: string): string {
    return markdown
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
