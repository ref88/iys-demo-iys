import React from 'react'

const TestComponent = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          RefuTree VMS Test
        </h1>
        <p className="text-gray-600">
          Als je dit ziet, werkt de basis React setup!
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 text-sm">
            ✅ React werkt<br/>
            ✅ Tailwind CSS werkt<br/>
            ✅ Component loading werkt
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestComponent 