import _ from 'lodash';
import React from 'react';
import {
  getEditorParams,
  EditorSDK,
  IEditorSDKConfig,
} from 'yoshi-flow-editor-runtime';
import { EditorSDK as IEditorSDK } from '@wix/platform-editor-sdk';
import RadioButtons from 'wix-base-ui/lib/controls/radioButtons';
import Checkbox from 'wix-base-ui/lib/controls/checkbox';
import TextLabel from 'wix-base-ui/lib/controls/textLabel';
import Divider from 'wix-base-ui/lib/controls/divider';
import SectionDivider from 'wix-base-ui/lib/controls/sectionDivider';
import Button from 'wix-base-ui/lib/controls/button';
import {
  ButtonLargeFixedBottom,
  RadioButtonsLabeled,
  Checkboxes,
  RadioButtons as RadioButtonsComposite,
} from 'wix-base-ui/lib/composites/composites';
import { EditorAppAPI } from '../../editor/appAPI';
import './speakersSettings.global.scss';
import '../../types/wixBaseUi';

const FILTER_TYPES = [
  { value: 'all', label: 'Show all Speakers' },
  { value: 'tag', label: 'Choose by Tag' },
];

const SORT_TYPES = [
  { value: 'user', label: 'User-defined order' },
  { value: 'abc', label: 'Alphabetically' },
];

interface SpeakersSettingsPanelProps {
  editorSDK: IEditorSDK;
  editorSDKConfig: IEditorSDKConfig;
}

interface SpeakersSettingsPanelState {
  ready: boolean;
  filterType: string;
  sortingType: string;
  filteredTags: Record<string, boolean>;
}

class SpeakersSettingsPanel extends React.Component<
  SpeakersSettingsPanelProps,
  SpeakersSettingsPanelState
> {
  private handleFilterTypeChanged: (filterType: string) => void;
  private handleSortingTypeChanged: (sortingType: string) => void;
  private handleTagToggleChanged: (tagKey: string, value: string) => void;
  private openDashboard: () => void;
  private appAPI!: EditorAppAPI;
  private componentId: string;
  private filterTags: Array<{ value: string; label: string }> = [];

  constructor(props: SpeakersSettingsPanelProps) {
    super(props);

    this.state = {
      ready: false,
      filterType: 'all',
      sortingType: 'abc',
      filteredTags: {},
    };

    const { componentId } = getEditorParams();
    if (!componentId) {
      throw new Error('No `componentId` was passed via query params');
    }
    this.componentId = componentId;

    this.handleFilterTypeChanged = filterType => {
      this.setState({ filterType });
      this.appAPI.updateWidgetProp(this.componentId, 'filterType', filterType);
    };

    this.handleSortingTypeChanged = sortingType => {
      this.setState({ sortingType });
      this.appAPI.updateWidgetProp(
        this.componentId,
        'sortingType',
        sortingType,
      );
    };

    this.handleTagToggleChanged = (tagKey, value) => {
      const { filteredTags } = this.state;

      _.set(filteredTags, tagKey, value);
      this.setState({ filteredTags });

      const tagsArray = _(filteredTags)
        .pickBy()
        .keys()
        .value();

      this.appAPI.updateWidgetProp(this.componentId, 'filteredTags', tagsArray);
    };

    this.openDashboard = async () => {
      this.appAPI.openDashboard();
    };
  }

  async componentDidMount() {
    const { editorSDK } = this.props;

    this.appAPI = await editorSDK.editor.getAppAPI();
    const initialProps = await this.appAPI.getWidgetProps(this.componentId);
    const tags = await this.appAPI.getTags();

    this.filterTags = _.map(tags, (label, value) => ({ value, label }));

    const filteredTagsAsObj = _(initialProps.filteredTags)
      .mapKeys()
      .mapValues(() => true)
      .value();

    this.setState({
      ...initialProps,
      filteredTags: filteredTagsAsObj,
      ready: true,
    });
  }

  renderFilterTags() {
    const { filterType, filteredTags } = this.state;

    return filterType === 'tag' ? (
      <div>
        <Divider />
        <Checkboxes>
          {this.filterTags.map(tag => (
            <Checkbox
              key={tag.value}
              value={filteredTags[tag.value]}
              shouldTranslate={false}
              label={tag.label}
              labelAfterSymbol
              onChange={(value: string) =>
                this.handleTagToggleChanged(tag.value, value)
              }
            />
          ))}
        </Checkboxes>
      </div>
    ) : null;
  }

  render() {
    const { filterType, sortingType, ready } = this.state;

    return (
      ready && (
        <div className="root-container">
          <RadioButtonsLabeled>
            <TextLabel value="Which speakers to display" />
            <RadioButtons
              value={filterType}
              onChange={this.handleFilterTypeChanged}
              shouldTranslate={false}
              options={FILTER_TYPES}
            />
          </RadioButtonsLabeled>
          {this.renderFilterTags()}
          <Divider long />
          <SectionDivider>Sorting</SectionDivider>
          <Divider long />
          <RadioButtonsComposite>
            <RadioButtons
              value={sortingType}
              onChange={this.handleSortingTypeChanged}
              shouldTranslate={false}
              options={SORT_TYPES}
            />
          </RadioButtonsComposite>
          <ButtonLargeFixedBottom>
            <Button onClick={this.openDashboard}>Add or Editor Speakers</Button>
          </ButtonLargeFixedBottom>
        </div>
      )
    );
  }
}

export default () => (
  <EditorSDK>
    {sdk => (
      <SpeakersSettingsPanel
        editorSDK={sdk.editorSDK as IEditorSDK}
        editorSDKConfig={sdk.editorSDKConfig}
      />
    )}
  </EditorSDK>
);
