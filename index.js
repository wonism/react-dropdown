import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const DEFAULT_PLACEHOLDER_STRING = 'Select...'

class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: props.value || {
        label: props.placeholder || DEFAULT_PLACEHOLDER_STRING,
        value: ''
      },
      isOpen: false
    }
    this.mounted = true
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value && newProps.value !== this.state.selected) {
      this.setState({selected: newProps.value})
    } else if (!newProps.value) {
      this.setState({selected: {
        label: newProps.placeholder || DEFAULT_PLACEHOLDER_STRING,
        value: ''
      }})
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
    document.addEventListener('touchend', this.handleDocumentClick, false)
  }

  componentDidUpdate () {
    const menu = ReactDOM.findDOMNode(this).children[1]

    if (menu) {
      const { options, value } = this.props
      const { clientHeight } = menu
      const boxHeight = menu.firstElementChild.clientHeight
      const hydratedOptions = options.map((option) => (typeof option === 'string' ? option : option.value))
      let index = -1

      if (typeof value === 'string') {
        index = hydratedOptions.findIndex((option) => (option === value))
      } else {
        index = hydratedOptions.findIndex((option) => (option === value.value))
      }

      menu.scrollTo(0, ((index + 0.5) * boxHeight) - clientHeight / 2)
    }
  }

  componentWillUnmount () {
    this.mounted = false
    document.removeEventListener('click', this.handleDocumentClick, false)
    document.removeEventListener('touchend', this.handleDocumentClick, false)
  }

  handleMouseDown (event) {
    if (this.props.onFocus && typeof this.props.onFocus === 'function') {
      this.props.onFocus(this.state.isOpen)
    }

    if (event.type === 'mousedown' && event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.disabled) {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  setValue (value, label) {
    const selected = this.state.selected
    const isSelected = typeof selected === 'string' ? value === selected : value === selected.value

    if (isSelected) {
      this.setState({ isOpen: false })
    } else {
      const newState = {
        selected: {
          value,
          label
        },
        isOpen: false
      }

      this.fireChangeEvent(newState)
      this.setState(newState)
    }
  }

  fireChangeEvent (newState) {
    if (newState.selected !== this.state.selected && this.props.onChange) {
      this.props.onChange(newState.selected)
    }
  }

  renderOption (option) {
    const { selected } = this.state

    const classes = {
      [`${this.props.baseClassName}-option`]: true,
      [option.className]: !!option.className,
      'is-selected': typeof selected === 'string' ? (option.value || option) === selected : (option.value || option) === selected.value
    }

    const optionClass = classNames(classes)

    const value = option.value || option.label || option
    const label = option.label || option.value || option

    return (
      <div
        key={value}
        className={optionClass}
        onMouseDown={this.setValue.bind(this, value, label)}
        onClick={this.setValue.bind(this, value, label)}>
        {label}
      </div>
    )
  }

  buildMenu () {
    const { options, baseClassName } = this.props
    const ops = options.map((option) => {
      if (option.type === 'group') {
        const groupTitle = (<div className={`${baseClassName}-title`}>{option.name}</div>)
        const _options = option.items.map((item) => this.renderOption(item))

        return (
          <div className={`${baseClassName}-group`} key={option.name}>
            {groupTitle}
            {_options}
          </div>
        )
      } else {
        return this.renderOption(option)
      }
    })

    return ops.length ? ops : <div className={`${baseClassName}-noresults`}>No options found</div>
  }

  handleDocumentClick (event) {
    if (this.mounted) {
      if (!ReactDOM.findDOMNode(this).contains(event.target)) {
        if (this.state.isOpen) {
          this.setState({ isOpen: false })
        }
      }
    }
  }

  render () {
    const { baseClassName, placeholderClassName, menuClassName, arrowClassName, className } = this.props

    const disabledClass = this.props.disabled ? 'Dropdown-disabled' : ''
    const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label

    const dropdownClass = classNames({
      [`${baseClassName}-root`]: true,
      [className]: !!className,
      'is-open': this.state.isOpen
    })
    const placeholderClass = classNames({
      [`${baseClassName}-placeholder`]: true,
      [placeholderClassName]: !!placeholderClassName
    })
    const menuClass = classNames({
      [`${baseClassName}-menu`]: true,
      [menuClassName]: !!menuClassName
    })
    const arrowClass = classNames({
      [`${baseClassName}-arrow`]: true,
      [arrowClassName]: !!arrowClassName
    })

    const value = (<div className={placeholderClass}>{placeHolderValue}</div>)
    const menu = this.state.isOpen ? <div className={menuClass}>{this.buildMenu()}</div> : null

    return (
      <div className={dropdownClass}>
        <div className={`${baseClassName}-control ${disabledClass}`} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)}>
          {value}
          <span className={arrowClass} />
        </div>
        {menu}
      </div>
    )
  }
}

Dropdown.defaultProps = { baseClassName: 'Dropdown' }
export default Dropdown
