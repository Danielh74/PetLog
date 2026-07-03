export default function JsonifyText(text: string) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();
}