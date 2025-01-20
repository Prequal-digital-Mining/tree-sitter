declare module 'web-tree-sitter' {
  /**
   * A position in a multi-line text document, in terms of rows and columns.
   *
   * Rows and columns are zero-based.
   */
  export interface Point {
	  row: number;
	  column: number;
  }
  /**
   *  A range of positions in a multi-line text document, both in terms of bytes
   *  and of rows and columns.
   */
  export interface Range {
	  startPosition: Point;
	  endPosition: Point;
	  startIndex: number;
	  endIndex: number;
  }
  /**
   * A summary of a change to a text document.
   */
  export interface Edit {
	  startPosition: Point;
	  oldEndPosition: Point;
	  newEndPosition: Point;
	  startIndex: number;
	  oldEndIndex: number;
	  newEndIndex: number;
  }
  /**
   * A callback for parsing that takes an index and point, and should return a string.
   */
  export type ParseCallback = (index: number, position: Point) => string | undefined;
  /**
	* A callback that receives the parse state during parsing.
	*/
  export type ProgressCallback = (progress: {
	  currentOffset: number;
  }) => boolean;
  /**
   * A callback for logging messages.
   *
   * If `isLex` is `true`, the message is from the lexer, otherwise it's from the parser.
   */
  export type LogCallback = (message: string, isLex: boolean) => void;
	/**
	 * Options for parsing
	 *
	 * The `includedRanges` property is an array of {@link Range} objects that
	 * represent the ranges of text that the parser should include when parsing.
	 *
	 * The `progressCallback` property is a function that is called periodically
	 * during parsing to check whether parsing should be cancelled.
	 *
	 * See {@link Parser#parse} for more information.
	 */
	export interface ParseOptions {
		/**
		 * An array of {@link Range} objects that
		 * represent the ranges of text that the parser should include when parsing.
		 *
		 * This sets the ranges of text that the parser should include when parsing.
		 * By default, the parser will always include entire documents. This
		 * function allows you to parse only a *portion* of a document but
		 * still return a syntax tree whose ranges match up with the document
		 * as a whole. You can also pass multiple disjoint ranges.
		 * If `ranges` is empty, then the entire document will be parsed.
		 * Otherwise, the given ranges must be ordered from earliest to latest
		 * in the document, and they must not overlap. That is, the following
		 * must hold for all `i` < `length - 1`:
		 * ```text
		 *     ranges[i].end_byte <= ranges[i + 1].start_byte
		 * ```
		 */
		includedRanges?: Range[];
		/**
		 * A function that is called periodically during parsing to check
		 * whether parsing should be cancelled. If the progress callback returns
		 * `false`, then parsing will be cancelled. You can also use this to instrument
		 * parsing and check where the parser is at in the document. The progress callback
		 * takes a single argument, which is a {@link ParseState} representing the current
		 * state of the parser.
		 */
		progressCallback?: (state: ParseState) => void;
	}
	/**
	 * A stateful object that is passed into the progress callback {@link ParseOptions#progressCallback}
	 * to provide the current state of the parser.
	 *
	 * The `currentOffset` property is the byte offset in the document that the parser is at.
	 */
	export interface ParseState {
		currentOffset: number;
	}
	export class Parser {
		/** The parser's current language. */
		private language;
		/**
		 * This must always be called before creating a Parser.
		 *
		 * You can optionally pass in options to configure the WASM module, the most common
		 * one being `locateFile` to help the module find the `.wasm` file.
		 */
		static init(moduleOptions?: EmscriptenModule): Promise<void>;
		/**
		 * Create a new parser.
		 */
		constructor();
		/** Delete the parser, freeing its resources. */
		delete(): void;
		/**
		 * Set the language that the parser should use for parsing.
		 *
		 * If the language was not successfully assigned, an error will be thrown.
		 * This happens if the language was generated with an incompatible
		 * version of the Tree-sitter CLI. Check the language's version using
		 * {@link Language#version} and compare it to this library's
		 * {@link LANGUAGE_VERSION} and {@link MIN_COMPATIBLE_VERSION} constants.
		 */
		setLanguage(language: Language | null): this;
		/**
		 * Parse a slice of UTF8 text.
		 *
		 * @param callback - The UTF8-encoded text to parse or a callback function.
		 *
		 * @param oldTree - A previous syntax tree parsed from the same document. If the text of the
		 *   document has changed since `oldTree` was created, then you must edit `oldTree` to match
		 *   the new text using {@link Tree#edit}.
		 *
		 * @param options - Options for parsing the text.
		 *  This can be used to set the included ranges, or a progress callback.
		 *
		 * @returns A {@link Tree} if parsing succeeded, or `null` if:
		 *  - The parser has not yet had a language assigned with {@link Parser#setLanguage}.
		 *  - The progress callback returned true.
		 */
		parse(callback: string | ParseCallback, oldTree?: Tree | null, options?: ParseOptions): Tree | null;
		/**
		 * Instruct the parser to start the next parse from the beginning.
		 *
		 * If the parser previously failed because of a timeout, cancellation,
		 * or callback, then by default, it will resume where it left off on the
		 * next call to {@link Parser#parse} or other parsing functions.
		 * If you don't want to resume, and instead intend to use this parser to
		 * parse some other document, you must call `reset` first.
		 */
		reset(): void;
		/** Get the ranges of text that the parser will include when parsing. */
		getIncludedRanges(): Range[];
		/**
		 * @deprecated since version 0.25.0, prefer passing a progress callback to {@link Parser#parse}
		 *
		 * Get the duration in microseconds that parsing is allowed to take.
		 *
		 * This is set via {@link Parser#setTimeoutMicros}.
		 */
		getTimeoutMicros(): number;
		/**
		 * @deprecated since version 0.25.0, prefer passing a progress callback to {@link Parser#parse}
		 *
		 * Set the maximum duration in microseconds that parsing should be allowed
		 * to take before halting.
		 *
		 * If parsing takes longer than this, it will halt early, returning `null`.
		 * See {@link Parser#parse} for more information.
		 */
		setTimeoutMicros(timeout: number): void;
		/** Set the logging callback that a parser should use during parsing. */
		setLogger(callback: LogCallback | boolean | null): this;
		/** Get the parser's current logger. */
		getLogger(): LogCallback | null;
	}
	export class Language {
		/**
		 * A list of all node types in the language. The index of each type in this
		 * array is its node type id.
		 */
		types: string[];
		/**
		 * A list of all field names in the language. The index of each field name in
		 * this array is its field id.
		 */
		fields: (string | null)[];
		constructor(internal: Internal, address: number);
		/**
		 * Gets the name of the language.
		 */
		get name(): string | null;
		/**
		 * Gets the version of the language.
		 */
		get version(): number;
		/**
		 * Gets the number of fields in the language.
		 */
		get fieldCount(): number;
		/**
		 * Gets the number of states in the language.
		 */
		get stateCount(): number;
		/**
		 * Get the field id for a field name.
		 */
		fieldIdForName(fieldName: string): number | null;
		/**
		 * Get the field name for a field id.
		 */
		fieldNameForId(fieldId: number): string | null;
		/**
		 * Get the node type id for a node type name.
		 */
		idForNodeType(type: string, named: boolean): number | null;
		/**
		 * Gets the number of node types in the language.
		 */
		get nodeTypeCount(): number;
		/**
		 * Get the node type name for a node type id.
		 */
		nodeTypeForId(typeId: number): string | null;
		/**
		 * Check if a node type is named.
		 *
		 * @see {@link https://tree-sitter.github.io/tree-sitter/using-parsers/2-basic-parsing.html#named-vs-anonymous-nodes}
		 */
		nodeTypeIsNamed(typeId: number): boolean;
		/**
		 * Check if a node type is visible.
		 */
		nodeTypeIsVisible(typeId: number): boolean;
		/**
		 * Get the supertypes ids of this language.
		 *
		 * @see {@link https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types.html?highlight=supertype#supertype-nodes}
		 */
		get supertypes(): number[];
		/**
		 * Get the subtype ids for a given supertype node id.
		 */
		subtypes(supertype: number): number[];
		/**
		 * Get the next state id for a given state id and node type id.
		 */
		nextState(stateId: number, typeId: number): number;
		/**
		 * Create a new lookahead iterator for this language and parse state.
		 *
		 * This returns `null` if state is invalid for this language.
		 *
		 * Iterating {@link LookaheadIterator} will yield valid symbols in the given
		 * parse state. Newly created lookahead iterators will return the `ERROR`
		 * symbol from {@link LookaheadIterator#currentType}.
		 *
		 * Lookahead iterators can be useful for generating suggestions and improving
		 * syntax error diagnostics. To get symbols valid in an `ERROR` node, use the
		 * lookahead iterator on its first leaf node state. For `MISSING` nodes, a
		 * lookahead iterator created on the previous non-extra leaf node may be
		 * appropriate.
		 */
		lookaheadIterator(stateId: number): LookaheadIterator | null;
		/**
		 * Create a new query from a string containing one or more S-expression
		 * patterns.
		 *
		 * The query is associated with a particular language, and can only be run
		 * on syntax nodes parsed with that language. References to Queries can be
		 * shared between multiple threads.
		 *
		 * @link {@see https://tree-sitter.github.io/tree-sitter/using-parsers/queries}
		 */
		query(source: string): Query;
		/**
		 * Load a language from a WebAssembly module.
		 * The module can be provided as a path to a file or as a buffer.
		 */
		static load(input: string | Uint8Array): Promise<Language>;
	}
	/** A tree that represents the syntactic structure of a source code file. */
	export class Tree {
		/** The language that was used to parse the syntax tree. */
		language: Language;
		/** Create a shallow copy of the syntax tree. This is very fast. */
		copy(): Tree;
		/** Delete the syntax tree, freeing its resources. */
		delete(): void;
		/** Get the root node of the syntax tree. */
		get rootNode(): Node;
		/**
		 * Get the root node of the syntax tree, but with its position shifted
		 * forward by the given offset.
		 */
		rootNodeWithOffset(offsetBytes: number, offsetExtent: Point): Node;
		/**
		 * Edit the syntax tree to keep it in sync with source code that has been
		 * edited.
		 *
		 * You must describe the edit both in terms of byte offsets and in terms of
		 * row/column coordinates.
		 */
		edit(edit: Edit): void;
		/** Create a new {@link TreeCursor} starting from the root of the tree. */
		walk(): TreeCursor;
		/**
		 * Compare this old edited syntax tree to a new syntax tree representing
		 * the same document, returning a sequence of ranges whose syntactic
		 * structure has changed.
		 *
		 * For this to work correctly, this syntax tree must have been edited such
		 * that its ranges match up to the new tree. Generally, you'll want to
		 * call this method right after calling one of the [`Parser::parse`]
		 * functions. Call it on the old tree that was passed to parse, and
		 * pass the new tree that was returned from `parse`.
		 */
		getChangedRanges(other: Tree): Range[];
		/** Get the included ranges that were used to parse the syntax tree. */
		getIncludedRanges(): Range[];
	}
	export class Node {
		/**
		 * The numeric id for this node that is unique.
		 *
		 * Within a given syntax tree, no two nodes have the same id. However:
		 *
		 * * If a new tree is created based on an older tree, and a node from the old tree is reused in
		 *   the process, then that node will have the same id in both trees.
		 *
		 * * A node not marked as having changes does not guarantee it was reused.
		 *
		 * * If a node is marked as having changed in the old tree, it will not be reused.
		 */
		id: number;
		/** The byte index where this node starts. */
		startIndex: number;
		/** The position where this node starts. */
		startPosition: Point;
		/** The tree that this node belongs to. */
		tree: Tree;
		/** Get this node's type as a numerical id. */
		get typeId(): number;
		/**
		 * Get the node's type as a numerical id as it appears in the grammar,
		 * ignoring aliases.
		 */
		get grammarId(): number;
		/** Get this node's type as a string. */
		get type(): string;
		/**
		 * Get this node's symbol name as it appears in the grammar, ignoring
		 * aliases as a string.
		 */
		get grammarType(): string;
		/**
		 * Check if this node is *named*.
		 *
		 * Named nodes correspond to named rules in the grammar, whereas
		 * *anonymous* nodes correspond to string literals in the grammar.
		 */
		get isNamed(): boolean;
		/**
		 * Check if this node is *extra*.
		 *
		 * Extra nodes represent things like comments, which are not required
		 * by the grammar, but can appear anywhere.
		 */
		get isExtra(): boolean;
		/**
		 * Check if this node represents a syntax error.
		 *
		 * Syntax errors represent parts of the code that could not be incorporated
		 * into a valid syntax tree.
		 */
		get isError(): boolean;
		/**
		 * Check if this node is *missing*.
		 *
		 * Missing nodes are inserted by the parser in order to recover from
		 * certain kinds of syntax errors.
		 */
		get isMissing(): boolean;
		/** Check if this node has been edited. */
		get hasChanges(): boolean;
		/**
		 * Check if this node represents a syntax error or contains any syntax
		 * errors anywhere within it.
		 */
		get hasError(): boolean;
		/** Get the byte index where this node ends. */
		get endIndex(): number;
		/** Get the position where this node ends. */
		get endPosition(): Point;
		/** Get the string content of this node. */
		get text(): string;
		/** Get this node's parse state. */
		get parseState(): number;
		/** Get the parse state after this node. */
		get nextParseState(): number;
		/** Check if this node is equal to another node. */
		equals(other: Node): boolean;
		/**
		 * Get the node's child at the given index, where zero represents the first child.
		 *
		 * This method is fairly fast, but its cost is technically log(n), so if
		 * you might be iterating over a long list of children, you should use
		 * {@link Node#children} instead.
		 */
		child(index: number): Node | null;
		/**
		 * Get this node's *named* child at the given index.
		 *
		 * See also {@link Node#isNamed}.
		 * This method is fairly fast, but its cost is technically log(n), so if
		 * you might be iterating over a long list of children, you should use
		 * {@link Node#namedChildren} instead.
		 */
		namedChild(index: number): Node | null;
		/**
		 * Get this node's child with the given numerical field id.
		 *
		 * See also {@link Node#childForFieldName}. You can
		 * convert a field name to an id using {@link Language#fieldIdForName}.
		 */
		childForFieldId(fieldId: number): Node | null;
		/**
		 * Get the first child with the given field name.
		 *
		 * If multiple children may have the same field name, access them using
		 * {@link Node#childrenForFieldName}.
		 */
		childForFieldName(fieldName: string): Node | null;
		/** Get the field name of this node's child at the given index. */
		fieldNameForChild(index: number): string | null;
		/** Get the field name of this node's named child at the given index. */
		fieldNameForNamedChild(index: number): string | null;
		/**
		 * Get an array of this node's children with a given field name.
		 *
		 * See also {@link Node#children}.
		 */
		childrenForFieldName(fieldName: string): (Node | null)[];
		/**
		  * Get an array of this node's children with a given field id.
		  *
		  * See also {@link Node#childrenForFieldName}.
		  */
		childrenForFieldId(fieldId: number): (Node | null)[];
		/** Get the node's first child that contains or starts after the given byte offset. */
		firstChildForIndex(index: number): Node | null;
		/** Get the node's first named child that contains or starts after the given byte offset. */
		firstNamedChildForIndex(index: number): Node | null;
		/** Get this node's number of children. */
		get childCount(): number;
		/**
		 * Get this node's number of *named* children.
		 *
		 * See also {@link Node#isNamed}.
		 */
		get namedChildCount(): number;
		/** Get this node's first child. */
		get firstChild(): Node | null;
		/**
		 * Get this node's first named child.
		 *
		 * See also {@link Node#isNamed}.
		 */
		get firstNamedChild(): Node | null;
		/** Get this node's last child. */
		get lastChild(): Node | null;
		/**
		 * Get this node's last named child.
		 *
		 * See also {@link Node#isNamed}.
		 */
		get lastNamedChild(): Node | null;
		/**
		 * Iterate over this node's children.
		 *
		 * If you're walking the tree recursively, you may want to use the
		 * {@link TreeCursor} APIs directly instead.
		 */
		get children(): (Node | null)[];
		/**
		 * Iterate over this node's named children.
		 *
		 * See also {@link Node#children}.
		 */
		get namedChildren(): (Node | null)[];
		/**
		 * Get the descendants of this node that are the given type, or in the given types array.
		 *
		 * The types array should contain node type strings, which can be retrieved from {@link Language#types}.
		 *
		 * Additionally, a `startPosition` and `endPosition` can be passed in to restrict the search to a byte range.
		 */
		descendantsOfType(types: string | string[], startPosition?: Point, endPosition?: Point): (Node | null)[];
		/** Get this node's next sibling. */
		get nextSibling(): Node | null;
		/** Get this node's previous sibling. */
		get previousSibling(): Node | null;
		/**
		 * Get this node's next *named* sibling.
		 *
		 * See also {@link Node#isNamed}.
		 */
		get nextNamedSibling(): Node | null;
		/**
		 * Get this node's previous *named* sibling.
		 *
		 * See also {@link Node#isNamed}.
		 */
		get previousNamedSibling(): Node | null;
		/** Get the node's number of descendants, including one for the node itself. */
		get descendantCount(): number;
		/**
		 * Get this node's immediate parent.
		 * Prefer {@link Node#childWithDescendant} for iterating over this node's ancestors.
		 */
		get parent(): Node | null;
		/**
		 * Get the node that contains `descendant`.
		 *
		 * Note that this can return `descendant` itself.
		 */
		childWithDescendant(descendant: Node): Node | null;
		/** Get the smallest node within this node that spans the given byte range. */
		descendantForIndex(start: number, end?: number): Node | null;
		/** Get the smallest named node within this node that spans the given byte range. */
		namedDescendantForIndex(start: number, end?: number): Node | null;
		/** Get the smallest node within this node that spans the given point range. */
		descendantForPosition(start: Point, end?: Point): Node | null;
		/** Get the smallest named node within this node that spans the given point range. */
		namedDescendantForPosition(start: Point, end?: Point): Node | null;
		/**
		 * Create a new {@link TreeCursor} starting from this node.
		 *
		 * Note that the given node is considered the root of the cursor,
		 * and the cursor cannot walk outside this node.
		 */
		walk(): TreeCursor;
		/**
		 * Edit this node to keep it in-sync with source code that has been edited.
		 *
		 * This function is only rarely needed. When you edit a syntax tree with
		 * the {@link Tree#edit} method, all of the nodes that you retrieve from
		 * the tree afterward will already reflect the edit. You only need to
		 * use {@link Node#edit} when you have a specific {@link Node} instance that
		 * you want to keep and continue to use after an edit.
		 */
		edit(edit: Edit): void;
		/** Get the S-expression representation of this node. */
		toString(): string;
	}
	/** A stateful object for walking a syntax {@link Tree} efficiently. */
	export class TreeCursor {
		/** Creates a deep copy of the tree cursor. This allocates new memory. */
		copy(): TreeCursor;
		/** Delete the tree cursor, freeing its resources. */
		delete(): void;
		/** Get the tree cursor's current {@link Node}. */
		get currentNode(): Node;
		/**
		 * Get the numerical field id of this tree cursor's current node.
		 *
		 * See also {@link TreeCursor#currentFieldName}.
		 */
		get currentFieldId(): number;
		/** Get the field name of this tree cursor's current node. */
		get currentFieldName(): string | null;
		/**
		 * Get the depth of the cursor's current node relative to the original
		 * node that the cursor was constructed with.
		 */
		get currentDepth(): number;
		/**
		 * Get the index of the cursor's current node out of all of the
		 * descendants of the original node that the cursor was constructed with.
		 */
		get currentDescendantIndex(): number;
		/** Get the type of the cursor's current node. */
		get nodeType(): string;
		/** Get the type id of the cursor's current node. */
		get nodeTypeId(): number;
		/** Get the state id of the cursor's current node. */
		get nodeStateId(): number;
		/** Get the id of the cursor's current node. */
		get nodeId(): number;
		/**
		 * Check if the cursor's current node is *named*.
		 *
		 * Named nodes correspond to named rules in the grammar, whereas
		 * *anonymous* nodes correspond to string literals in the grammar.
		 */
		get nodeIsNamed(): boolean;
		/**
		 * Check if the cursor's current node is *missing*.
		 *
		 * Missing nodes are inserted by the parser in order to recover from
		 * certain kinds of syntax errors.
		 */
		get nodeIsMissing(): boolean;
		/** Get the string content of the cursor's current node. */
		get nodeText(): string;
		/** Get the start position of the cursor's current node. */
		get startPosition(): Point;
		/** Get the end position of the cursor's current node. */
		get endPosition(): Point;
		/** Get the start index of the cursor's current node. */
		get startIndex(): number;
		/** Get the end index of the cursor's current node. */
		get endIndex(): number;
		/**
		 * Move this cursor to the first child of its current node.
		 *
		 * This returns `true` if the cursor successfully moved, and returns
		 * `false` if there were no children.
		 */
		gotoFirstChild(): boolean;
		/**
		 * Move this cursor to the last child of its current node.
		 *
		 * This returns `true` if the cursor successfully moved, and returns
		 * `false` if there were no children.
		 *
		 * Note that this function may be slower than
		 * {@link TreeCursor#gotoFirstChild} because it needs to
		 * iterate through all the children to compute the child's position.
		 */
		gotoLastChild(): boolean;
		/**
		 * Move this cursor to the parent of its current node.
		 *
		 * This returns `true` if the cursor successfully moved, and returns
		 * `false` if there was no parent node (the cursor was already on the
		 * root node).
		 *
		 * Note that the node the cursor was constructed with is considered the root
		 * of the cursor, and the cursor cannot walk outside this node.
		 */
		gotoParent(): boolean;
		/**
		 * Move this cursor to the next sibling of its current node.
		 *
		 * This returns `true` if the cursor successfully moved, and returns
		 * `false` if there was no next sibling node.
		 *
		 * Note that the node the cursor was constructed with is considered the root
		 * of the cursor, and the cursor cannot walk outside this node.
		 */
		gotoNextSibling(): boolean;
		/**
		 * Move this cursor to the previous sibling of its current node.
		 *
		 * This returns `true` if the cursor successfully moved, and returns
		 * `false` if there was no previous sibling node.
		 *
		 * Note that this function may be slower than
		 * {@link TreeCursor#gotoNextSibling} due to how node
		 * positions are stored. In the worst case, this will need to iterate
		 * through all the children up to the previous sibling node to recalculate
		 * its position. Also note that the node the cursor was constructed with is
		 * considered the root of the cursor, and the cursor cannot walk outside this node.
		 */
		gotoPreviousSibling(): boolean;
		/**
		 * Move the cursor to the node that is the nth descendant of
		 * the original node that the cursor was constructed with, where
		 * zero represents the original node itself.
		 */
		gotoDescendant(goalDescendantIndex: number): void;
		/**
		 * Move this cursor to the first child of its current node that contains or
		 * starts after the given byte offset.
		 *
		 * This returns `true` if the cursor successfully moved to a child node, and returns
		 * `false` if no such child was found.
		 */
		gotoFirstChildForIndex(goalIndex: number): boolean;
		/**
		 * Move this cursor to the first child of its current node that contains or
		 * starts after the given byte offset.
		 *
		 * This returns the index of the child node if one was found, and returns
		 * `null` if no such child was found.
		 */
		gotoFirstChildForPosition(goalPosition: Point): boolean;
		/**
		 * Re-initialize this tree cursor to start at the original node that the
		 * cursor was constructed with.
		 */
		reset(node: Node): void;
		/**
		 * Re-initialize a tree cursor to the same position as another cursor.
		 *
		 * Unlike {@link TreeCursor#reset}, this will not lose parent
		 * information and allows reusing already created cursors.
		 */
		resetTo(cursor: TreeCursor): void;
	}
	/**
	 * Options for query execution
	 */
	export interface QueryOptions {
		/** The start position of the range to query */
		startPosition?: Point;
		/** The end position of the range to query */
		endPosition?: Point;
		/** The start index of the range to query */
		startIndex?: number;
		/** The end index of the range to query */
		endIndex?: number;
		/**
		 * The maximum number of in-progress matches for this query.
		 * The limit must be > 0 and <= 65536.
		 */
		matchLimit?: number;
		/**
		 * The maximum start depth for a query cursor.
		 *
		 * This prevents cursors from exploring children nodes at a certain depth.
		 * Note if a pattern includes many children, then they will still be
		 * checked.
		 *
		 * The zero max start depth value can be used as a special behavior and
		 * it helps to destructure a subtree by staying on a node and using
		 * captures for interested parts. Note that the zero max start depth
		 * only limit a search depth for a pattern's root node but other nodes
		 * that are parts of the pattern may be searched at any depth what
		 * defined by the pattern structure.
		 *
		 * Set to `null` to remove the maximum start depth.
		 */
		maxStartDepth?: number;
		/**
		 * The maximum duration in microseconds that query execution should be allowed to
		 * take before halting.
		 *
		 * If query execution takes longer than this, it will halt early, returning an empty array.
		 */
		timeoutMicros?: number;
		/**
		 * A function that will be called periodically during the execution of the query to check
		 * if query execution should be cancelled. You can also use this to instrument query execution
		 * and check where the query is at in the document. The progress callback takes a single argument,
		 * which is a {@link QueryState} representing the current state of the query.
		 */
		progressCallback?: (state: QueryState) => void;
	}
	/**
	 * A stateful object that is passed into the progress callback {@link QueryOptions#progressCallback}
	 * to provide the current state of the query.
	 *
	 * The `currentOffset` property is the byte offset in the document that the query is at.
	 */
	export interface QueryState {
		currentOffset: number;
	}
	/** A record of key-value pairs associated with a particular pattern in a {@link Query}. */
	export type QueryProperties = Record<string, string | null>;
	/**
	 * A predicate that contains an operator and list of operands.
	 */
	export interface QueryPredicate {
		operator: string;
		operands: PredicateStep[];
	}
	/**
	 * A particular {@link Node} that has been captured with a particular name within a
	 * {@link Query}.
	 */
	export interface QueryCapture {
		name: string;
		node: Node;
		setProperties?: QueryProperties;
		assertedProperties?: QueryProperties;
		refutedProperties?: QueryProperties;
	}
	/** A quantifier for captures */
	export const CaptureQuantifier: {
		readonly Zero: 0;
		readonly ZeroOrOne: 1;
		readonly ZeroOrMore: 2;
		readonly One: 3;
		readonly OneOrMore: 4;
	};
	/** A quantifier for captures */
	export type CaptureQuantifier = typeof CaptureQuantifier[keyof typeof CaptureQuantifier];
	/** A match of a {@link Query} to a particular set of {@link Node}s. */
	export interface QueryMatch {
		pattern: number;
		captures: QueryCapture[];
		setProperties?: QueryProperties;
		assertedProperties?: QueryProperties;
		refutedProperties?: QueryProperties;
	}
	/**
	 * Predicates are represented as a single array of steps. There are two
	 * types of steps, which correspond to the two legal values for
	 * the `type` field:
	 *
	 * - `capture` - Steps with this type represent names
	 *    of captures. The `name` field is the name of the capture.
	 *
	 * - `string` - Steps with this type represent literal
	 *    strings. The `value` field is the string value.
	 */
	export type PredicateStep = {
		type: 'string';
		value: string;
	} | {
		type: 'capture';
		name: string;
	};
	export type TextPredicate = (captures: QueryCapture[]) => boolean;
	export class Query {
		/** The names of the captures used in the query. */
		readonly captureNames: string[];
		/** The quantifiers of the captures used in the query. */
		readonly captureQuantifiers: CaptureQuantifier[][];
		/**
		 * The other user-defined predicates associated with the given index.
		 *
		 * This includes predicates with operators other than:
		 * - `match?`
		 * - `eq?` and `not-eq?`
		 * - `any-of?` and `not-any-of?`
		 * - `is?` and `is-not?`
		 * - `set!`
		 */
		readonly predicates: QueryPredicate[][];
		/** The properties for predicates with the operator `set!`. */
		readonly setProperties: QueryProperties[];
		/** The properties for predicates with the operator `is?`. */
		readonly assertedProperties: QueryProperties[];
		/** The properties for predicates with the operator `is-not?`. */
		readonly refutedProperties: QueryProperties[];
		/** The maximum number of in-progress matches for this cursor. */
		matchLimit?: number;
		/** Delete the query, freeing its resources. */
		delete(): void;
		/**
		 * Iterate over all of the matches in the order that they were found.
		 *
		 * Each match contains the index of the pattern that matched, and a list of
		 * captures. Because multiple patterns can match the same set of nodes,
		 * one match may contain captures that appear *before* some of the
		 * captures from a previous match.
		 *
		 * @param node - The node to execute the query on.
		 *
		 * @param options - Options for query execution.
		 */
		matches(node: Node, options?: QueryOptions): QueryMatch[];
		/**
		 * Iterate over all of the individual captures in the order that they
		 * appear.
		 *
		 * This is useful if you don't care about which pattern matched, and just
		 * want a single, ordered sequence of captures.
		 *
		 * @param node - The node to execute the query on.
		 *
		 * @param options - Options for query execution.
		 */
		captures(node: Node, options?: QueryOptions): QueryCapture[];
		/** Get the predicates for a given pattern. */
		predicatesForPattern(patternIndex: number): QueryPredicate[];
		/**
		 * Disable a certain capture within a query.
		 *
		 * This prevents the capture from being returned in matches, and also
		 * avoids any resource usage associated with recording the capture.
		 */
		disableCapture(captureName: string): void;
		/**
		 * Disable a certain pattern within a query.
		 *
		 * This prevents the pattern from matching, and also avoids any resource
		 * usage associated with the pattern. This throws an error if the pattern
		 * index is out of bounds.
		 */
		disablePattern(patternIndex: number): void;
		/**
		 * Check if, on its last execution, this cursor exceeded its maximum number
		 * of in-progress matches.
		 */
		didExceedMatchLimit(): boolean;
		/** Get the byte offset where the given pattern starts in the query's source. */
		startIndexForPattern(patternIndex: number): number;
		/** Get the byte offset where the given pattern ends in the query's source. */
		endIndexForPattern(patternIndex: number): number;
		/** Get the number of patterns in the query. */
		patternCount(): number;
		/** Get the index for a given capture name. */
		captureIndexForName(captureName: string): number;
		/** Check if a given pattern within a query has a single root node. */
		isPatternRooted(patternIndex: number): boolean;
		/** Check if a given pattern within a query has a single root node. */
		isPatternNonLocal(patternIndex: number): boolean;
		/**
		 * Check if a given step in a query is 'definite'.
		 *
		 * A query step is 'definite' if its parent pattern will be guaranteed to
		 * match successfully once it reaches the step.
		 */
		isPatternGuaranteedAtStep(byteIndex: number): boolean;
	}
	export class LookaheadIterator implements Iterable<string> {
		/** Get the current symbol of the lookahead iterator. */
		get currentTypeId(): number;
		/** Get the current symbol name of the lookahead iterator. */
		get currentType(): string;
		/** Delete the lookahead iterator, freeing its resources. */
		delete(): void;
		/**
		 * Reset the lookahead iterator.
		 *
		 * This returns `true` if the language was set successfully and `false`
		 * otherwise.
		 */
		reset(language: Language, stateId: number): boolean;
		/**
		 * Reset the lookahead iterator to another state.
		 *
		 * This returns `true` if the iterator was reset to the given state and
		 * `false` otherwise.
		 */
		resetState(stateId: number): boolean;
		[Symbol.iterator](): Iterator<string>;
	}

	export {};
}

//# sourceMappingURL=web-tree-sitter.d.ts.map