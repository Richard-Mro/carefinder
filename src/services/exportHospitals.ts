
export const exportHospitals = async (
  hospitalList: { id: string; name: string; address: string; phone: string; website: string }[],
  searchKeyword?: { value: string } | string
) => {
  try {
    console.log('🛫 Sending hospitals to backend:', hospitalList.length)

    const keyword =
      typeof searchKeyword === 'string' ? searchKeyword : searchKeyword?.value || 'all'

    const response = await fetch(
      'https://us-central1-carefinder-70ff2.cloudfunctions.net/exportHospitalsToCSV',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitals: hospitalList,
          keyword: keyword.trim().toLowerCase().replace(/\s+/g, '_') || 'all'
        })
      }
    )

    const result = await response.json()

    if (result.url) {
      console.log('✅ CSV generated at:', result.url)
      window.open(result.url, '_blank')
    } else {
      console.error('❌ No URL returned')
    }
  } catch (error) {
    console.error('🔥 EXPORT FAILED:', error)
    alert('Export failed. Check console.')
  }
}

