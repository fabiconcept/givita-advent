import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildSoftwareApplicationSchema,
} from '@/lib/structured-data'

export function StructuredData() {
  const organizationSchema = buildOrganizationSchema()
  const websiteSchema = buildWebSiteSchema()
  const softwareAppSchema = buildSoftwareApplicationSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
    </>
  )
}
