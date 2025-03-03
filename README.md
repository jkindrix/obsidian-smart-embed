# Obsidian Smart Embed

Embed full markdown files seamlessly into your notes, allowing their content to appear as if it were written directly in place. Unlike Obsidian’s `![[]]` syntax, which creates links to external files, this method fully integrates the text, supporting bulk imports based on file naming patterns.

## Key Features

- **Inline File Insertion:** Directly embed the full content of a specific markdown file.
- **Batch Inclusion by Prefix:** Automatically import all markdown files that share a common name prefix.
- **Flexible Sorting:** Arrange embedded content based on filename, creation date, last modification date, or reverse order.
- **Multiple File Embeds:** Embed multiple files in a single block for enhanced flexibility.
- **Copy Button:** Quickly copy embedded content to the clipboard.

## Installation

### **Option 1: Install via Obsidian Community Plugins**

1. Open **Obsidian** and navigate to **Settings → Community Plugins**.
2. Click **Browse**, search for **"Smart Embed"**, and install it.
3. Enable the plugin under **Installed Plugins**.

### **Option 2: Manual Installation**

1. Download the latest release from [GitHub Releases](x).
2. Place `main.js` into your vault’s `.obsidian/plugins/` directory.
3. Enable it from **Settings → Community Plugins**.

## Usage Guide

### **Insert a Specific File**

Embed the complete content of a markdown file named `Example-Note.md` from the current vault:

```
```smart-embed
[[Example-Note]]
```
```

### **Embed Multiple Files with a Common Prefix**

```
```smart-embed
prefix:journal-
```
```

This automatically inserts the content of all markdown files that begin with `journal-`.

### **Sorting Options**

Define sorting preferences within the embed block to control how multiple files are arranged:

```
```smart-embed
prefix:journal-
sort:name    # Alphabetical order (A → Z) **(default)**
```
```

```
```smart-embed
prefix:journal-
sort:created    # Oldest to newest (by creation date)
```
```

```
```smart-embed
prefix:journal-
sort:modified   # Oldest to newest (by last modification date)
```
```

```
```smart-embed
prefix:journal-
sort:reverse    # Reverse default sorting order
```
```

### **Example Output**

Before embedding:

```
```smart-embed
prefix:journal-
sort:created
```
```

After embedding:

```
# Journal Entry 1

(Content from journal-2023-01.md)

# Journal Entry 2

(Content from journal-2023-02.md)
```

## Embed Multiple Files in a Single Block

You can now embed multiple markdown files within a single `smart-embed` block by listing them together:

### **Embed Multiple Specific Files**
```
```smart-embed
[[Note-One]]
[[Note-Two]]
[[Note-Three#Section]]
```
```
This will embed the full content of `Note-One.md`, `Note-Two.md`, and only the `Section` from `Note-Three.md`.

### **Handling Missing Files and Sections**
- If a referenced file does not exist, an error message will indicate that the file was not found.
- If a section reference (e.g., `[[Note#Section]]`) is invalid or missing, an error message will indicate that the section could not be found.

### **Example Output**
If `Note-One.md` and `Note-Two.md` exist but `Note-Three.md` lacks the requested section:
```
# Content from Note-One

(Content from Note-One.md)

---

# Content from Note-Two

(Content from Note-Two.md)

---

**Error:** Section 'Section' not found in 'Note-Three'
```

This enhancement allows for greater flexibility when embedding multiple files at once, reducing the need for multiple separate embed blocks.

## Copy Button Feature

- Every embedded block includes a **Copy** button.
- Clicking the button copies the embedded content to the clipboard.
- The button text changes to **"Copied!"** temporarily after a successful copy.

## Troubleshooting

### **1. Embedded files don’t appear**

- Ensure the plugin is enabled under **Settings → Community Plugins**.
- Verify that the referenced files exist in your vault.

### **2. Sorting doesn’t apply correctly**

- Ensure the embedded files have valid metadata (creation/modification dates).
- Restart Obsidian if the order doesn’t update immediately.

### **3. Syntax Errors**

- Wrap your embed commands inside a code block (` ```smart-embed``` `).

## Development Notes

- `versions.json` keeps track of past versions and their release timestamps.
- `changelog.json` automatically logs changes based on recent Git commits.

## Acknowledgments

This project is inspired by [obsidian-dynamic-embed](https://github.com/dabravin/obsidian-dynamic-embed) by [dabravin](https://github.com/dabravin). Their work laid the foundation for seamless embedding of markdown content in Obsidian.

While **Obsidian Smart Embed** extends and refines this concept by adding batch imports, sorting options, and improved markdown integration, the core idea originates from their excellent implementation.

Huge thanks to [dabravin](https://github.com/dabravin) for their contributions to the Obsidian community!
