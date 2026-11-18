"use client"
import React, { useEffect } from 'react'

import Prism from 'prismjs'
import parse, { Element, type HTMLReactParserOptions } from 'html-react-parser'

import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-aspnet";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-solidity";
import "prismjs/components/prism-json";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-r";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-go";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-mongodb";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

// Der HTML-Inhalt kommt von Benutzer:innen (TinyMCE) und wird ohne Prüfung gespeichert.
// html-react-parser ist laut eigener Doku NICHT XSS-sicher. Darum entfernen wir hier
// gefährliche Tags und Attribute, bevor wir rendern (Schutz vor Stored XSS).
const BLOCKED_TAGS = new Set([
  "script", "style", "iframe", "frame", "object", "embed", "link", "meta", "base",
  "form", "input", "button", "textarea", "select", "svg", "math",
])

const URL_ATTRIBUTES = new Set(["href", "src", "action", "formaction", "xlink:href"])

const parserOptions: HTMLReactParserOptions = {
  replace(node) {
    if (!(node instanceof Element)) return

    if (BLOCKED_TAGS.has(node.name)) return <></>

    for (const name of Object.keys(node.attribs)) {
      const value = node.attribs[name] ?? ""
      const isEventHandler = name.toLowerCase().startsWith("on")
      const isScriptUrl = URL_ATTRIBUTES.has(name.toLowerCase()) && /^\s*(javascript|data|vbscript):/i.test(value)

      if (isEventHandler || isScriptUrl || name.toLowerCase() === "srcdoc") {
        delete node.attribs[name]
      }
    }
  },
}

interface Props {
  data: string
}

const ParseHTML = ({ data }: Props) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [data])

  return (
    <div className="markdown w-full min-w-full">
      {parse(data, parserOptions)}
    </div>
  )
}

export default ParseHTML
