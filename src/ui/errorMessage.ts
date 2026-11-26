import { ApiError } from '../api/client.ts'

export const NO_CHARACTERS_MESSAGE = '이 계정에 캐릭터가 없습니다.'

// 오류 종류마다 사용자에게 다른 문구를 보여준다 (docs/design/systems/api.md)
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'invalid-key':
        return 'API 키가 올바르지 않습니다. 키를 다시 확인해 주세요.'
      case 'rate-limit':
        return '호출 한도를 넘었습니다. 잠시 후 다시 시도해 주세요.'
      case 'network':
        return '네트워크 오류로 불러오지 못했습니다. 연결을 확인해 주세요.'
      case 'server':
        return `NEXON Open API 오류로 불러오지 못했습니다. (${error.code ?? '알 수 없음'})`
    }
  }
  return '알 수 없는 오류로 불러오지 못했습니다.'
}
