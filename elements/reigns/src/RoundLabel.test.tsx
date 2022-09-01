import { render } from '@testing-library/react'
import { createGameDefinition } from './features/game/objectMother'
import { RoundLabel } from './RoundLabel'
describe('RoundLabel', () => {

  it('returns empty for round 0', () => {

    const gameDefinition = createGameDefinition()
    const res = render(<RoundLabel round={0} gameDefinition={gameDefinition} />)
    expect(res.container.innerHTML).toBe('')
  })

  it('returns round label and value when round number above zero', () => {
    const gameDefinition = createGameDefinition()
    const res = render(<RoundLabel round={12} gameDefinition={gameDefinition} />)
    expect(res.container.textContent).toBe('Day 12')
  })

  it('use custom round name', () => {
    const gameDefinition = createGameDefinition({ roundName: 'minutes'})
    const res = render(<RoundLabel round={12} gameDefinition={gameDefinition} />)
    expect(res.container.textContent).toBe('minutes 12')
  })

  it('shows victoryRoundThreshold when present', () => {
    const gameDefinition = createGameDefinition({ roundName: 'minutes', victoryRoundThreshold: 123})
    const res = render(<RoundLabel round={12} gameDefinition={gameDefinition} />)
    expect(res.container.textContent).toBe('minutes 12 / 123')
  })
})