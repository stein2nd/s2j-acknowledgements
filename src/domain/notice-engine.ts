export type NoticeEngine = "onot" | "oss-notice";

export function resolveNoticeEngine(pipeline?: { engine?: NoticeEngine }): NoticeEngine {
  if (pipeline?.engine === "oss-notice") {
    return "oss-notice";
  }
  return "onot";
}
