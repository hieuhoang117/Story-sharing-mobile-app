import BAD_WORDS_DATA from '../Story-sharing-mobile-app/vi.json'

// Đảm bảo lấy đúng mảng từ JSON (xử lý cả trường hợp default export)
const BAD_WORDS: string[] = Array.isArray(BAD_WORDS_DATA) ? BAD_WORDS_DATA : (BAD_WORDS_DATA as any).default || []

// Sort một lần duy nhất ở ngoài function để tối ưu hiệu suất
const SORTED = [...BAD_WORDS].sort((a, b) => b.length - a.length)

interface BadWordsOptions {
    validate?: boolean
    replace?: boolean
    replacement?: string
}

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // bỏ dấu accents
        .replace(/đ/g, 'd') // chuyển đ thành d
        .replace(/\s+/g, '') // bỏ khoảng trắng
}

function isCompatible(segment: string, word: string): boolean {
    if (segment.length !== word.length) return false

    for (let i = 0; i < segment.length; i++) {
        const s = segment[i]
        const w = word[i]

        if (s === w) continue

        const sNorm = s
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .toLowerCase()
        const wNorm = w
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .toLowerCase()

        if (sNorm !== wNorm) return false
        // If s has an accent (s !== sNorm), it MUST match w exactly (already checked s === w)
        // If it doesn't match w and has an accent, it's a different word (false positive)
        if (s !== sNorm) return false
    }
    return true
}

export default function badWords(content: string, options: BadWordsOptions = {}): boolean | string {
    const { validate = false, replace = options.validate ? false : true, replacement = '***' } = options

    if (validate) {
        const rawContent = content.toLowerCase().replace(/\s+/g, '')
        const strippedContent = normalizeText(content)

        return SORTED.some((word) => {
            const strippedWord = normalizeText(word)
            const rawWord = word.toLowerCase().replace(/\s+/g, '')

            let index = strippedContent.indexOf(strippedWord)
            while (index !== -1) {
                const segment = rawContent.substring(index, index + strippedWord.length)
                if (isCompatible(segment, rawWord)) {
                    return true
                }
                index = strippedContent.indexOf(strippedWord, index + 1)
            }
            return false
        })
    }

    if (replace) {
        let result = content

        SORTED.forEach((word) => {
            // Thử replace chính xác từ trong text gốc trước
            const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            result = result.replace(new RegExp(escaped, 'gi'), (match) => {
                return replacement.length === 1 ? replacement.repeat(match.length) : replacement
            })
        })

        return result
    }

    return content
}
