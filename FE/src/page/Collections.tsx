import { useIsMobile } from '../components/Header'
import { CollectionsDesktop } from './CollectionsDesktop'
import { CollectionsMobile } from './CollectionsMobile'

export default function CollectionsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <CollectionsMobile /> : <CollectionsDesktop />
}
