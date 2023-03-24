import { extensionSpec, React, appActions, getAppStore, LayoutContextToolProps, Immutable, i18n } from 'jimu-core'
import { IMWidgetState } from '../config'
import { defaultMessages } from 'jimu-ui'
import dataOutlined from 'jimu-icons/svg/outlined/data/data.svg'

const isExpressionEnabled = (props: LayoutContextToolProps): boolean => {
  const widgetId = props.layoutItem.widgetId
  const widgetJson = getAppStore().getState().appConfig?.widgets?.[widgetId]
  const expressionEnabled = (widgetJson?.useDataSources != null && widgetJson?.useDataSources?.length > 0) && widgetJson?.useDataSourcesEnabled
  return expressionEnabled
}

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 1
  id = 'text-expression'
  widgetId: string

  disabled (props: LayoutContextToolProps): boolean {
    const disabled = !isExpressionEnabled(props)
    return disabled
  }

  getGroupId (): string {
    return null
  }

  getTitle (props: LayoutContextToolProps): string {
    const expressionEnabled = isExpressionEnabled(props)
    const translation = expressionEnabled ? 'dynamicContent' : 'dynamicContentTip'
    const intl = i18n.getIntl('_jimu')
    if (!intl) return translation
    return intl.formatMessage({ id: translation, defaultMessage: defaultMessages[translation] })
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetState: IMWidgetState = getAppStore().getState().widgetsState[widgetId] ?? Immutable({})
    return !!widgetState.showExpression
  }

  getIcon (): any {
    return dataOutlined
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const widgetState: IMWidgetState = getAppStore().getState().widgetsState[widgetId] ?? Immutable({})

    const showExpression = !widgetState.showExpression

    if (showExpression) {
      if (!getAppStore().getState().widgetsRuntimeInfo[widgetId].isInlineEditing) {
        getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, true))
      }
    }
    getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', showExpression))
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
