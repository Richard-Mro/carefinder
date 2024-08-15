describe('My First Test', () => {
  it('visits the app root url', () => {
    // Visit the app's root URL
    cy.visit('/')

    // Wait for the loading spinner to disappear
    cy.get('body').should('have.class', 'loaded')

    // Verify the h1 text content
    cy.get('h1')
      .invoke('text')
      .then((text) => {
        console.log('H1 text content:', text)
      })

    // Check that the expected content is present
    cy.contains('h1', 'CareFinder')
  })
})
