import { useParams } from 'react-router'
import PagePlaceholder from '@/components/PagePlaceholder'

export default function BoardPage() {
  const { boardId } = useParams()

  return (
    <PagePlaceholder
      title="Board"
      note={`Columns, cards and presence arrive in slice 13. Route param: ${boardId ?? 'none'}`}
    />
  )
}
