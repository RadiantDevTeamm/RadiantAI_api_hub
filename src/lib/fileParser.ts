export type FileKind = 'image' | 'audio' | 'video' | 'document';

export interface ParsedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  ext: string;
  kind: FileKind;
  dataUrl?: string;
  duration?: number;
}

export interface PendingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  kind: FileKind;
  dataUrl?: string;
  duration?: number;
}

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const AUDIO_EXTS = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const DOC_EXTS = [
  'txt', 'md', 'markdown', 'json', 'js', 'jsx', 'ts', 'tsx', 'py',
  'css', 'html', 'xml', 'yaml', 'yml', 'csv', 'sh', 'sql', 'go',
  'rs', 'java', 'c', 'cpp', 'h', 'rb', 'php', 'swift', 'kt', 'scala',
  'toml', 'ini', 'env', 'log', 'pdf',
];

const ACCEPTED_EXTENSIONS = [...IMAGE_EXTS, ...AUDIO_EXTS, ...VIDEO_EXTS, ...DOC_EXTS];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for base64

export const ACCEPTED_FILE_TYPES = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',');

export function isAcceptedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function getFileKind(ext: string): FileKind {
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  return 'document';
}

function getFileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = file.type.startsWith('audio')
      ? new Audio(url)
      : document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      const d = isFinite(el.duration) ? el.duration : undefined;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
  });
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(bytes);

    const textParts: string[] = [];
    const regex = /\(((?:[^()\\]|\\.|(?:\([^()]*\)))*)\)/g;
    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = regex.exec(raw)) !== null && count < 50000) {
      let text = match[1];
      text = text.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
      if (text.length > 0 && /^[\x20-\x7E\u0400-\u04FF\u0080-\u024F\s]+$/.test(text)) {
        textParts.push(text);
        count += text.length;
      }
    }

    if (textParts.length === 0) {
      return `[PDF file: ${file.name}]\n\n[Note: This PDF appears to be image-based or encrypted. Text extraction was not possible.]`;
    }
    return textParts.join(' ');
  } catch {
    return `[PDF file: ${file.name}]\n\n[Note: Could not extract text from this PDF.]`;
  }
}

async function extractJsonText(file: File): Promise<string> {
  const text = await file.text();
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = getFileExt(file.name);
  const kind = getFileKind(ext);

  if (file.size > MAX_FILE_SIZE) {
    return {
      id: uid(), name: file.name, size: file.size, type: file.type, ext, kind,
      content: `[File: ${file.name}]\n\n[Note: File exceeds 10MB size limit and its content was not loaded.]`,
    };
  }

  // Images: convert to base64 data URL for vision models
  if (kind === 'image') {
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        id: uid(), name: file.name, size: file.size, type: file.type, ext, kind,
        content: `[Image: ${file.name}]\n\n[Note: Image exceeds 5MB limit and was not sent to the model.]`,
      };
    }
    const dataUrl = await fileToDataUrl(file);
    return {
      id: uid(), name: file.name, size: file.size, type: file.type, ext, kind,
      dataUrl,
      content: `[Image attached: ${file.name}]`,
    };
  }

  // Audio: get duration, create metadata context
  if (kind === 'audio') {
    const duration = await getMediaDuration(file);
    const durStr = duration ? `${Math.round(duration)}s` : 'unknown duration';
    return {
      id: uid(), name: file.name, size: file.size, type: file.type, ext, kind,
      duration,
      content: `[Audio file attached: ${file.name}]\nFormat: ${ext.toUpperCase()}\nDuration: ${durStr}\nSize: ${formatFileSize(file.size)}\n\n[Note: Audio content cannot be directly transcribed by this client. The model receives metadata only.]`,
    };
  }

  // Video: get duration, create metadata context
  if (kind === 'video') {
    const duration = await getMediaDuration(file);
    const durStr = duration ? `${Math.round(duration)}s` : 'unknown duration';
    return {
      id: uid(), name: file.name, size: file.size, type: file.type, ext, kind,
      duration,
      content: `[Video file attached: ${file.name}]\nFormat: ${ext.toUpperCase()}\nDuration: ${durStr}\nSize: ${formatFileSize(file.size)}\n\n[Note: Video content cannot be directly processed by this client. The model receives metadata only.]`,
    };
  }

  // Documents
  let content: string;
  if (ext === 'pdf') {
    content = await extractPdfText(file);
  } else if (ext === 'json') {
    content = await extractJsonText(file);
  } else {
    content = await file.text();
  }

  const MAX_CONTENT = 100_000;
  if (content.length > MAX_CONTENT) {
    content = content.slice(0, MAX_CONTENT) + '\n\n[... content truncated due to length ...]';
  }

  return { id: uid(), name: file.name, size: file.size, type: file.type, ext, kind, content };
}

/** Pre-parse a pending file for preview (generates thumbnail dataUrl, duration) */
export async function preParseFile(file: File): Promise<Partial<PendingFile>> {
  const ext = getFileExt(file.name);
  const kind = getFileKind(ext);
  const extra: Partial<PendingFile> = { kind };

  if (kind === 'image' && file.size <= MAX_IMAGE_SIZE) {
    extra.dataUrl = await fileToDataUrl(file);
  } else if (kind === 'audio' || kind === 'video') {
    extra.duration = await getMediaDuration(file);
  }
  return extra;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || !isFinite(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export function formatPromptWithFiles(question: string, files: ParsedFile[]): string {
  if (files.length === 0) return question;

  const fileBlocks = files.map((f) => {
    return `[Attached File: ${f.name}]\n\n${f.content}`;
  });
  return `${fileBlocks.join('\n\n')}\n\n[User Question]: ${question}`;
}

export function getFileIconName(ext: string): string {
  const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'rb', 'php', 'swift', 'kt', 'scala', 'sh', 'sql'];
  const docExts = ['txt', 'md', 'markdown', 'csv', 'log', 'env', 'ini', 'toml'];
  if (ext === 'pdf') return 'FileText';
  if (ext === 'json' || ext === 'yaml' || ext === 'yml' || ext === 'xml') return 'Braces';
  if (ext === 'html' || ext === 'css') return 'Code2';
  if (codeExts.includes(ext)) return 'FileCode2';
  if (docExts.includes(ext)) return 'FileText';
  return 'File';
}
