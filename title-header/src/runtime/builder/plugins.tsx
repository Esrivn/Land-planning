import { React, IMState, appActions, getAppStore, ReactRedux, ImmutableArray, UseDataSource, WidgetInitResizeCallback } from 'jimu-core'
import { Bubble, Expression, RichPluginInjectedProps } from 'jimu-ui/advanced/rich-text-editor'
import { defaultMessages, hooks } from 'jimu-ui'

interface _TextPliuginsProps {
  useDataSources: ImmutableArray<UseDataSource>
  widgetId: string
  onInitResizeHandler?: WidgetInitResizeCallback
}

export type TextPliuginsProps = _TextPliuginsProps & RichPluginInjectedProps

export const TextPlugins = (props: TextPliuginsProps): React.ReactElement => {
  const { editor, formats, selection, useDataSources, widgetId, onInitResizeHandler } = props
  const showExpression = ReactRedux.useSelector((state: IMState) => state.widgetsState[widgetId]?.showExpression)
  const translate = hooks.useTranslate(defaultMessages)
  //When version1 changes, `Bubble` will be hidden
  const [version1, setVersion1] = React.useState(0)
  //When version2 changes, `Expression` will be repositioned
  const [version2, setVersion2] = React.useState(0)
  const expressNodeRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    onInitResizeHandler?.(() => {
      setVersion1(v => v + 1)
      expressNodeRef.current?.classList.add('d-none')
    }, null, () => {
      setVersion2(v => v + 1)
      expressNodeRef.current?.classList.remove('d-none')
    })
  }, [onInitResizeHandler])

  const headerProps = React.useMemo(() => ({
    title: translate('dynamicContent'),
    onClose: () => getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', false))
  }), [widgetId, translate])

  return (
    <>
      <Bubble editor={editor} formats={formats} selection={selection} source='user' version={version1} />
      <Expression
        ref={expressNodeRef}
        version={version2}
        source='user'
        editor={editor}
        formats={formats}
        selection={selection}
        open={showExpression}
        useDataSources={useDataSources}
        header={headerProps}
        widgetId={widgetId}
      />
    </>
  )
}
