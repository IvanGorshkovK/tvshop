import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text)' }}>
          <div style={{ fontSize: 56 }}>😕</div>
          <h2>Что-то пошло не так</h2>
          <p style={{ color: 'var(--muted)' }}>Произошла ошибка. Попробуйте обновить страницу.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
