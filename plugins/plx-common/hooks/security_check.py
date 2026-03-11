#!/usr/bin/env python3
"""
PLUXITY 프론트엔드 보안 패턴 감지 훅.

PreToolUse 이벤트에서 Write/Edit 도구 사용 시 실행됩니다.
위험한 보안 패턴을 감지하면 경고를 출력합니다.
세션별 중복 경고를 방지합니다 (같은 패턴은 1회만 표시).
"""

import json
import os
import re
import sys
import tempfile

# 세션별 경고 추적 파일
WARNED_FILE = os.path.join(tempfile.gettempdir(), "plx_security_warned.json")

# 감지할 보안 패턴
SECURITY_PATTERNS = [
    {
        "id": "eval",
        "pattern": r"\beval\s*\(",
        "severity": "critical",
        "message": "eval() 사용이 감지되었습니다. 임의 코드 실행 위험이 있습니다.",
        "suggestion": "JSON.parse(), Map, 또는 switch 문을 사용하세요.",
    },
    {
        "id": "new_function",
        "pattern": r"\bnew\s+Function\s*\(",
        "severity": "critical",
        "message": "new Function() 사용이 감지되었습니다. 동적 코드 생성 위험이 있습니다.",
        "suggestion": "정적 함수 정의를 사용하세요.",
    },
    {
        "id": "dangerously_set_inner_html",
        "pattern": r"dangerouslySetInnerHTML",
        "severity": "high",
        "message": "dangerouslySetInnerHTML 사용이 감지되었습니다. XSS 취약점 위험이 있습니다.",
        "suggestion": "DOMPurify로 sanitize하거나 마크다운 렌더러를 사용하세요.",
    },
    {
        "id": "inner_html",
        "pattern": r"\.innerHTML\s*=",
        "severity": "high",
        "message": "innerHTML 직접 할당이 감지되었습니다. XSS 취약점 위험이 있습니다.",
        "suggestion": "textContent 또는 React의 JSX를 사용하세요.",
    },
    {
        "id": "document_write",
        "pattern": r"document\.write\s*\(",
        "severity": "high",
        "message": "document.write() 사용이 감지되었습니다. XSS 취약점 위험이 있습니다.",
        "suggestion": "DOM API (createElement, appendChild) 또는 React를 사용하세요.",
    },
    {
        "id": "env_api_key",
        "pattern": r"(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})",
        "severity": "critical",
        "message": "실제 API 키가 감지되었습니다. 코드에 키를 직접 포함하지 마세요.",
        "suggestion": "환경변수 또는 시크릿 매니저를 사용하세요.",
    },
    {
        "id": "github_actions_injection",
        "pattern": r"\$\{\{\s*github\.event\.(issue|pull_request|comment)\.(title|body)",
        "severity": "high",
        "message": "GitHub Actions 인젝션 위험이 감지되었습니다.",
        "suggestion": "환경변수로 전달하여 셸 인젝션을 방지하세요.",
    },
]

SEVERITY_ICONS = {
    "critical": "\U0001f6d1",  # 🛑
    "high": "\U0001f534",      # 🔴
    "medium": "\U0001f7e1",    # 🟡
}


def load_warned():
    """이미 경고한 패턴 ID 목록을 로드합니다."""
    try:
        with open(WARNED_FILE, "r") as f:
            return set(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_warned(warned):
    """경고한 패턴 ID 목록을 저장합니다."""
    try:
        with open(WARNED_FILE, "w") as f:
            json.dump(list(warned), f)
    except OSError:
        pass


def check_content(content, file_path=""):
    """콘텐츠에서 보안 패턴을 검사합니다."""
    findings = []

    for rule in SECURITY_PATTERNS:
        # .env 파일의 API 키만 검사하는 패턴은 .env 파일에서만
        if rule["id"] == "env_api_key" and not re.search(r"\.env", file_path):
            # 일반 코드에서도 하드코딩된 키는 검사
            if not re.search(rule["pattern"], content):
                continue

        if re.search(rule["pattern"], content):
            findings.append(rule)

    return findings


def main():
    try:
        data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, EOFError):
        # 입력이 없거나 잘못된 경우 통과
        print(json.dumps({"decision": "approve"}))
        return

    tool_input = data.get("tool_input", {})
    content = tool_input.get("content", "") or tool_input.get("new_string", "")
    file_path = tool_input.get("file_path", "")

    if not content:
        print(json.dumps({"decision": "approve"}))
        return

    findings = check_content(content, file_path)

    if not findings:
        print(json.dumps({"decision": "approve"}))
        return

    # 세션별 중복 방지
    warned = load_warned()
    new_findings = [f for f in findings if f["id"] not in warned]

    if not new_findings:
        # 이미 경고한 패턴만 있으면 통과
        print(json.dumps({"decision": "approve"}))
        return

    # 새 경고 기록
    for f in new_findings:
        warned.add(f["id"])
    save_warned(warned)

    # 경고 메시지 구성
    warnings = []
    for f in new_findings:
        icon = SEVERITY_ICONS.get(f["severity"], "\U0001f7e1")
        warnings.append(f'{icon} [{f["severity"].upper()}] {f["message"]}\n   → {f["suggestion"]}')

    reason = "\u26a0\ufe0f 보안 경고:\n" + "\n".join(warnings)

    # 경고만 표시하고 차단하지 않음 (approve + reason)
    print(json.dumps({"decision": "approve", "reason": reason}))


if __name__ == "__main__":
    main()
