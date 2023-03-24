import { extensionSpec, React, getAppStore, appActions, LayoutContextToolProps, i18n } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import editOutlined from 'jimu-icons/svg/outlined/editor/edit.svg'

export default class TextTool implements extensionSpec.ContextToolExtension {
  index = 0
  id = 'inline-editing'
  widgetId: string

  getGroupId (): string {
    return null
  }

  getTitle (): string {
    const intl = i18n.getIntl('_jimu')
    return intl != null ? intl.formatMessage({ id: 'edit', defaultMessage: defaultMessages.edit }) : 'Edit'
  }

  getIcon (): any {
    return editOutlined
  }

  checked (props: LayoutContextToolProps): boolean {
    const widgetId = props.layoutItem.widgetId
    const widgetsRuntimeInfo = getAppStore().getState().widgetsRuntimeInfo
    const checked = widgetsRuntimeInfo[widgetId]?.isInlineEditing
    return !!checked
  }

  onClick (props: LayoutContextToolProps): void {
    const widgetId = props.layoutItem.widgetId
    const widgetsRuntimeInfo = getAppStore().getState().widgetsRuntimeInfo
    const isInlineEditing = widgetsRuntimeInfo[widgetId]?.isInlineEditing
    getAppStore().dispatch(appActions.setWidgetIsInlineEditingState(widgetId, !isInlineEditing))
    if (isInlineEditing) {
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', false))
    }
  }

  getSettingPanel (): React.ComponentClass<unknown> {
    return null
  }
}
