/** @jsx jsx */
import { React, jsx, css, ImmutableArray, UseDataSource, SerializedStyles, WidgetInitResizeCallback } from 'jimu-core'
import { Editor as EditorType, RenderPlugin } from 'jimu-ui/advanced/rich-text-editor'
import { EditorPlaceholder, EditorPlaceholderProps } from './placeholder'
import { TextPlugins } from './plugins'
import { getInvalidDataSourceIds } from './utils'
const { useMemo, useCallback } = React

interface EditorProps extends Omit<EditorPlaceholderProps, 'modules' | 'plugin' | 'editorRef'> {
  widgetId: string
  onInitResizeHandler?: WidgetInitResizeCallback
  useDataSources?: ImmutableArray<UseDataSource>
  onCreate?: (editor: EditorType) => void
  onDestory?: () => void
  value?: string
}

export const usePlugin = (widgetId: string, useDataSources: ImmutableArray<UseDataSource>, onInitResizeHandler: WidgetInitResizeCallback): RenderPlugin => {
  return React.useMemo(() => {
    return ({ editor, selection, formats }) => {
      return <TextPlugins editor={editor} selection={selection} formats={formats} widgetId={widgetId} useDataSources={useDataSources} onInitResizeHandler={onInitResizeHandler} />
    }
  }, [onInitResizeHandler, useDataSources, widgetId])
}

const INVALID_STYLE = css`
  opacity: 0.5;
  background: red;
  outline: 1px solid white;
`

export const useInvalidStyle = (value: string, useDataSources: ImmutableArray<UseDataSource>): SerializedStyles => {
  return useMemo(() => {
    // Find the invalid data source from the text
    // Because the text in config is not saved in real time,
    // so the update of invalid data source here may be delayed. [TODO]
    const dsids = getInvalidDataSourceIds(value, useDataSources)
    let expressionStyles
    if (dsids != null && dsids.length > 0) {
      expressionStyles = dsids.map(dsid => {
        return css`
          exp[data-dsid*="${dsid}"] {
           ${INVALID_STYLE}
          }
        `
      })
    }
    return css`${expressionStyles}`
  }, [value, useDataSources])
}

export const useEditorCycle = (onEditorCreate, onEditorDestory): (editor: any) => any => {
  return useCallback(editor => {
    return editor != null ? onEditorCreate?.(editor) : onEditorDestory?.()
  }, [onEditorCreate, onEditorDestory])
}

export const Editor = (props: EditorProps): React.ReactElement => {
  const {
    value,
    widgetId,
    useDataSources,
    onChange,
    onCreate: onEditorCreate,
    onDestory: onEditorDestory,
    onInitResizeHandler,
    ...others
  } = props

  const setEditor = useEditorCycle(onEditorCreate, onEditorDestory)
  const plugin = usePlugin(widgetId, useDataSources, onInitResizeHandler)
  const style = useInvalidStyle(value, useDataSources)
console.log(style);

  return (
    <EditorPlaceholder
      editorRef={setEditor}
      css={style}
      value={value}
      plugin={plugin}
      onChange={onChange}
      {...others}
    />
  )
}
