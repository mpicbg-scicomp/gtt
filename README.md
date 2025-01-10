# GTT
Gitlab Time Tracker App provides overview of how your team spent time resources.

## Gitlab Time Tracker User Interface
This application gives an overview of team spent times on specific projects and groups.

## Installation & getting started
* Please install `GTT` from the proper installation media.
  * For mac, use `gtt-*.*.*.dmg`
  * For linux, use `gtt-*.*.*.AppImage`
  * For windows, use `gtt-Setup-1.2.0.exe`

* Get started
  * Setup `API key` in `Preferences`
    - Generate `API key` with `api` scope in your `User settings/Access Tokens` in `GitLab`
    - Copy the key and paste it into `Gitlab Token` field in `Preferences`
    - Click `Save`
  * Enter `Project` and `User` in `Home`
  * Click `Refresh`

## How to organize the issues with labs
Each project has ```topics``` attribute in the gitlab project setting where we add relevant keywords. ```gtt``` parses the specific form of string, ```title: Gitlab Time Tracker, contact: HongKee Moon, group: SCICOMP``` where it accumulate times along with ```title``` and ```group``` for the project management purpose even though other uses spent their time. ```contact``` information is used for specifying who project is for. Those information is visualized in ```Spent time in projects``` and ```Spent time in labs``` pie charts.

![project_topics](img/gtt_project_topics.png)
You can describe your project with topics and special tags for ```gtt```

![spent_time_in_projects](img/gtt_spent_time_in_projects.png)
Project title is used for the chart label.

![spent_time_in_labs](img/gtt_spent_time_in_labs.png)
Lab based pie chart uses ```group: SCICOMP``` tag.

## Preference

### User Groups
This information is used for billing category in ```Person``` based data table view.
![user_groups](img/gtt_user_groups.png)

### Tag Colors
This json information is used to select colors for tags in ```Issue``` based data table view.
![tag_colors](img/gtt_tag_colors.png)
