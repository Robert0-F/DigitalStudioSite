"use client";

import { Component } from "react";

/**
 * Keeps SSR HTML visible if client hydration/render throws on mobile WebKit.
 */
export default class ClientErrorTrap extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err) {
    if (typeof window !== "undefined") {
      console.error("[ClientErrorTrap]", err);
    }
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            margin: "1rem",
            padding: "1rem",
            borderRadius: "12px",
            background: "#fffbf7",
            border: "1px solid rgba(23,20,17,0.15)",
            color: "#171411",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontWeight: 700, margin: 0 }}>Клиентская ошибка на телефоне</p>
          <p style={{ margin: "0.5rem 0 0", fontSize: 14, color: "#5c564e" }}>
            {String(this.state.err?.message || this.state.err)}
          </p>
          {this.props.children}
        </div>
      );
    }
    return this.props.children;
  }
}
