import type { DiscoveredFile, ParsedSegment } from './scan.types.js'

export interface TrieNode {
  segment: ParsedSegment | null
  children: Map<string, TrieNode>
  files: DiscoveredFile[]
  dynamicChild: TrieNode | null
  typedDynamicChild: TrieNode | null
  catchAllChild: TrieNode | null
}
