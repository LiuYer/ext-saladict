import search, { OALDResultLex, OALDResultRelated } from '@/components/dictionaries/oald/engine'
import { appConfigFactory, AppConfigMutable } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/OALD/engine', () => {
  beforeAll(() => {
    const response = {
      love: fs.readFileSync(path.join(__dirname, 'response/love.html'), 'utf8'),
      love_2: fs.readFileSync(path.join(__dirname, 'response/love_2.html'), 'utf8'),
      jumblish: fs.readFileSync(path.join(__dirname, 'response/jumblish.html'), 'utf8'),
    }

    window.fetch = jest.fn((url: string) => {
      const key = Object.keys(response).find(keyword => url.endsWith(keyword))
      if (key) {
        return Promise.resolve({
          text: () => response[key]
        })
      }
      return Promise.reject(new Error(`Missing Response file for ${url}`))
    })
  })

  it('should parse lex result correctly', () => {
    return search('love', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio && typeof searchResult.audio.uk).toBe('string')
        expect(searchResult.audio && typeof searchResult.audio.us).toBe('string')

        const result = searchResult.result as OALDResultLex
        expect(result.type).toBe('lex')
        expect(result.items).toHaveLength(2)

        result.items.forEach(item => {
          expect(typeof item.title).toBe('string')
          expect(item.title).toBeTruthy()
          expect(typeof item.defs).toBe('string')
          expect(item.defs).toBeTruthy()
          expect(item.prons).toHaveLength(2)
        })
      })
  })

  it('should parse related result correctly', () => {
    return search('jumblish', appConfigFactory())
      .then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as OALDResultRelated
        expect(result.type).toBe('related')
        expect(typeof result.list).toBe('string')
      })
  })
})
