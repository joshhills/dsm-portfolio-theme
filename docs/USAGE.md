# Usage

## Quick-Start

This guide will detail how to get your own portfolio of work up and running.

### Forking



### Self-Hosting



### Customising



### Submitting Work



#### Project



#### Vignette



#### Summary



## Fresh Theme Installation

A partial Jekyll site with dummy information has already been generated to use a basis for modification. If you would prefer to make your own for whatever reason, you can incorporate this theme into your own site by adding this line to your Jekyll site's `Gemfile`:

```ruby
gem "dsm-portfolio"
```

And furthermore adding this line to your Jekyll site's `_config.yml`:

```yaml
theme: dsm-portfolio
```

Finally, execute:

    $ bundle

Alternatively, you may install it using:

    $ gem install dsm-portfolio 

## About

### Technologies

Jekyll has been chosen as...

### Stakeholders

Administration and students are the two intended users. It is the responsibility of the administration to procedurally maintain pre-ordained living documentation, and the students themselves to utilise the latest version of the administration's fork of the repository to carry out and share their work.

### Taxonomy

Jekyll defines different conceptual levels for labelling information, which are integrated in different ways with the theme.

Following best-practice, the necessary units of information are split between different folders in order to enforce a separation of concerns between stakeholders. The primary outcomes of this arranagement are ease-of-use, maintainability and extensibility. This taxonomy describes the current featureset of the theme.

// TODO: Image of administration taxonomy here

As far as the administration is concerned, all modifiable information is ingrained into the higher-level theme. This includes small units of data such as technical information about the year's intended projects, skills/targets/competencies, and useful departmental links (in '_data'), in addition to the more thorough aforementioned documentation (in the '_documentation' collection).

// TODO: Image of student taxonomy here

As far as students are concerned, alterations to the base theme's global variables occur in the '_config' file for personalisation on their own fork. Furthermore, they will use the theme by adding documents to the relevant folders, with relevant fields (following dummy templates). This workflow has been streamlined to reduce the steps necessary to create a professional and useful portfolio of evaluated work. Many fields are optional, and work outside of the scope of the administration may also be incorporated.

## Process

The process for making alterations as a member of the administration is...

The process for submitting work as a student is...

See 'modifications' for information about altering this process.

## Privacy

// TODO: Talk about what can be git-ignored to hide certain stuff.