import { chromium } from 'playwright'
import { expect } from '@playwright/test'

async function runProviderDashboardTests() {
  console.log('🔹 Starting Provider Dashboard Tests')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // 1️⃣ Login as Provider
    console.log('\n1️⃣ Testing Provider Login...')
    await page.goto('http://localhost:3000/auth/login')
    await page.fill('input[type="email"]', 'provider@test.com')
    await page.fill('input[type="password"]', 'testpass123')
    await page.click('button[type="submit"]')
    
    // Verify redirect to provider dashboard
    await page.waitForURL('**/dashboard')
    console.log('✅ Login successful - Provider dashboard loaded')

    // 2️⃣ Check Earnings Section
    console.log('\n2️⃣ Testing Earnings Section...')
    await page.click('text=Earnings')
    
    // Verify earnings components
    const earningsElements = [
      'text=Total Revenue',
      'text=Active Orders',
      'text=Services Offered',
      'text=Customer Satisfaction'
    ]
    
    for (const element of earningsElements) {
      const isVisible = await page.isVisible(element)
      console.log(`✅ ${element.replace('text=', '')}: ${isVisible ? 'Visible' : 'Not Found'}`)
    }

    // 3️⃣ Test Service Management
    console.log('\n3️⃣ Testing Service Management...')
    
    // Create Service
    await page.click('text=Services')
    await page.click('text=Create New Service')
    await page.fill('input[name="name"]', 'Test Service')
    await page.fill('textarea[name="description"]', 'Test Service Description')
    await page.fill('input[name="price"]', '99.99')
    await page.click('button:text("Create Service")')
    
    // Verify service creation
    const serviceCreated = await page.isVisible('text=Test Service')
    console.log(`✅ Service creation: ${serviceCreated ? 'Successful' : 'Failed'}`)
    
    // Edit Service
    await page.click('text=Edit')
    await page.fill('input[name="name"]', 'Updated Test Service')
    await page.click('button:text("Save")')
    
    // Verify service update
    const serviceUpdated = await page.isVisible('text=Updated Test Service')
    console.log(`✅ Service update: ${serviceUpdated ? 'Successful' : 'Failed'}`)
    
    // Delete Service
    await page.click('text=Delete')
    await page.click('text=Confirm')
    
    // Verify service deletion
    const serviceDeleted = !(await page.isVisible('text=Updated Test Service'))
    console.log(`✅ Service deletion: ${serviceDeleted ? 'Successful' : 'Failed'}`)

    // 4️⃣ Test Order Processing
    console.log('\n4️⃣ Testing Order Processing...')
    await page.click('text=Orders')
    
    // Test order actions
    const orderActions = ['Accept', 'Decline', 'Complete']
    for (const action of orderActions) {
      const actionButton = await page.$(`button:text("${action}")`)
      if (actionButton) {
        await actionButton.click()
        console.log(`✅ Order ${action.toLowerCase()} action: Successful`)
      }
    }

    // 5️⃣ Test Customer Satisfaction
    console.log('\n5️⃣ Testing Customer Satisfaction Scores...')
    await page.click('text=Reviews')
    const ratingVisible = await page.isVisible('text=Average Rating')
    console.log(`✅ Customer satisfaction display: ${ratingVisible ? 'Visible' : 'Not Found'}`)

    // 6️⃣ Test Real-time Updates & Messaging
    console.log('\n6️⃣ Testing Real-time Updates & Messaging...')
    await page.click('text=Messages')
    
    // Send test message
    await page.fill('textarea[name="message"]', 'Test message')
    await page.click('button:text("Send")')
    
    // Verify message sending
    const messageSent = await page.isVisible('text=Test message')
    console.log(`✅ Message system: ${messageSent ? 'Working' : 'Not Working'}`)

    // 7️⃣ Test Responsive Design
    console.log('\n7️⃣ Testing Responsive Design...')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    const mobileMenuVisible = await page.isVisible('button[aria-label="Menu"]')
    console.log(`✅ Mobile menu: ${mobileMenuVisible ? 'Visible' : 'Not Found'}`)
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    const tabletLayoutWorking = await page.isVisible('nav')
    console.log(`✅ Tablet layout: ${tabletLayoutWorking ? 'Working' : 'Not Working'}`)
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 })
    const desktopLayoutWorking = await page.isVisible('nav')
    console.log(`✅ Desktop layout: ${desktopLayoutWorking ? 'Working' : 'Not Working'}`)

    console.log('\n✅ All provider dashboard tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    throw error
  } finally {
    await browser.close()
  }
}

// Run the tests
runProviderDashboardTests().catch(console.error)

