import { IMThemeVariables, css, polished } from 'jimu-core'
export const getStyle = (theme: IMThemeVariables, reference) => {
  return css`
    & {
      max-height: ${polished.rem(300)};
      width: ${polished.rem(reference?.current?.clientWidth)};
      overflow: auto;
      padding-top: 0;
      padding-bottom: 0;
      visibility: unset !important;
    }
    &.result-list-con .dropdown-item {
      text-overflow: ellipsis;
      white-space: pre-wrap;
      font-family: roboto
    }
    &.result-list-con .dropdown-item:disabled, &.result-list-con .dropdown-item:disabled:hover {
      color: ${theme?.colors?.palette?.secondary?.[800]};
      background-color: ${theme?.colors?.palette?.light?.[200]};
    }
    &.result-list-con .dropdown-item:hover, &.result-list-con .dropdown-item:focus {
      color: ${theme?.colors?.black};
      background-color: ${theme?.colors?.palette?.light?.[100]};
    }
    &.result-list-con .dropdown-divider {
      margin-left: 0;
      margin-right: 0;
    }
    &.result-list-con .dropdown-item.active {
      background: ${theme?.colors?.primary};
      color: ${theme?.colors?.white};
    }
    .show-result-button:active, &.result-list-con .show-result-button:focus, &.result-list-con .show-result-button:hover {
      background-color: ${theme?.colors?.white};
    }
    .dropdown-menu--inner {
      max-height: none;
    }
    .jimu-dropdown-item {
      min-height: ${polished.rem(32)};
    }
    .clear-recent-search-con {
      color: var(--primary) !important;
      height: ${polished.rem(40)};
      margin-top: ${polished.rem(-4)};
    }
    .dropdown-divider {
      min-height: 0;
    }
    .item-p-l {
      padding-left: ${polished.rem(42)} !important;
    }
    .source-label-con {
      color: var(--black) !important;
      font-weight: bold !important;
    }
  `
}

export const dropdownStyle = () => {
  return css`
    .search-dropdown-button {
      position: absolute;
      top: 0;
      bottom: 0;
      height: auto;
      z-index: -1;
    }
    & {
      position: initial;
    }
  `
}
