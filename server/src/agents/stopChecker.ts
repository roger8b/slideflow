/**
 * StopChecker for ADK LoopAgent.
 * Returns true when session.state['valid'] === true,
 * causing the LoopAgent to exit early on successful validation.
 */

export interface SessionState {
  valid?: boolean
  [key: string]: any
}

export function shouldStop(state: SessionState): boolean {
  return state.valid === true
}
