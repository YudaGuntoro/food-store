import { getContactSettings } from '../contact-settings'
import { absoluteUrl, jsonLd, schoolName } from '../seo'

export default async function SchoolStructuredData() {
  const contact = await getContactSettings()
  const schoolId = absoluteUrl('/#school')
  const sameAs = [contact.instagramUrl, contact.tiktokUrl, contact.facebookUrl].filter(url => url?.startsWith('https://'))
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'School', '@id': schoolId, name: schoolName, url: absoluteUrl('/'),
        image: absoluteUrl('/og'),
        ...(contact.address ? { address: contact.address } : {}),
        ...(contact.whatsappNumber ? { telephone: contact.whatsappNumber } : {}),
        ...(contact.email ? { email: contact.email } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      { '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'), name: schoolName, inLanguage: 'id-ID', publisher: { '@id': schoolId } },
    ],
  }
  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
}
