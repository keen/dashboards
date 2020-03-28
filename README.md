# Dashboards by Keen IO

Building an analytics dashboard? Don’t start from scratch. Grab one of our CSS Grid-based templates and admire your data in minutes.

**UPDATE: All examples in this repo have been updated to use [keen-dataviz.js](https://github.com/keen/keen-dataviz.js) and [keen-analysis.js](https://github.com/keen/keen-analysis.js), as well as CDN versions of all dependencies.** When producing charts with [keen-dataviz.js](https://github.com/keen/keen-dataviz.js), the HTML wrapper for each chart (`.chart-wrapper`, described below) is rendered automatically.

Begin with a layout:

![Hero Thirds Example](http://cl.ly/image/3v2H180U0k0Q/Screen%20Shot%202014-10-29%20at%203.12.24%20AM.png)

Add charts to each `chart-stage` HTML element:

```html
<div class="grid-hero">
  <div class="hero chart-wrapper">
    <div class="chart-title">
      Chart Title
    </div>
    <div class="chart-stage">
      <div id="grid-1-1">
        <!-- chart goes here! -->
      </div>
    </div>
    <div class="chart-notes">
      Notes about this chart (optional)
    </div>
  </div>
</div>
```

And voilà!

![Sample Dashboard](http://cl.ly/image/1T3a0X402r0W/Screen%20Shot%202014-10-29%20at%203.35.04%20AM.png)

An attractive, custom analytics dashboard that's ready to be shown to your team or your customers. No hours lost tweaking CSS or testing responsiveness on eight different mobile devices.

## The Templates

These layout templates are composed of a minimal set of custom styles. They cover the most common use cases and layout configurations we've encountered so far.

* [Layouts](http://keen.github.io/dashboards/layouts/) for pre-built, responsive dashboard views
* [Examples](http://keen.github.io/dashboards/examples/) for specific domains, data models and popular integrations

## Integrations

These templates can work with any data source or charting library, but they're particularly streamlined to work with Keen IO's [Dataviz SDK](https://github.com/keen/keen-dataviz.js). You can add some charts to your dashboard with just a few lines of code. [Talk to our team](https://try.keen.io/contact) to get started today.

## Usage

Ready to use one of these awesome layouts? Here's how to get started.

1. Download a copy of this repository as a zip file, using [this link](https://github.com/keen/dashboards/archive/gh-pages.zip). You can also type `git clone https://github.com/keen/dashboards` in your terminal.

2. Check out the various [layouts](http://keen.github.io/dashboards/layouts/) and pick the one that best suits your needs. Find the template in the repository you downloaded at `folder/layouts/(name-of-template)`.

3. Start editing! In the destination folder will exist an `.html` file. Open it in your favorite text editor. There are three things you need to do to edit your dashboard:
  1. Setup: If you're a registered Keen IO user, navigate to [your keen project](http://keen.io/login?s=gh-dashboards) or if you don't have a user at first, you can simply use some demo data that we've prepared for you. You can access those by going to the repository and navigating to demo-data. There, you will see some javascript files with some code in them. We will simply paste those in the .html file.
  2. Some copypasta. When you navigate to the bottom of the .html file, you can see that there are a bunch of script tags. Just before the end of the body tag, we're going to add in the code from sample.html. Simply copy and paste the code just before you see ```</body>```.
  3. Once you've done that we need to hook up the specific items within the template to the code that we've just pasted in to our file. Each KeenDataviz instance has `container` property, which is a node selector required by *query*. That means that this *query* will try to find inside the html file a specified node. Please bear in mind that you have to set a height of this node in your stylesheet or using inline CSS. In these templates, you will see lines of that resemble something like:
  ```html
  <div class="chart-stage"> <!-- This is where you need to put the id property in! -->
    <img data-src="holder.js/100%x650/white">
  </div>
  ```
  Now we're going to change those lines so that it looks like this:
  ```html
  <div class="chart-stage" id="chart-01"> <!-- This is where you need to put the id property in! -->
    <!-- Get rid of that img tag! -->
  </div>
  ```

You're finished! Congratulations on setting up your first chart! Repeat step three with the rest of the items in the template to complete your dashboard!


## Docker
Clone the repository.
```
$ git clone https://github.com/keen/dashboards.git
```
Access the repository and build your Docker image.
```
$ cd dashboards
$ docker build -t keen/dashboards .
```
Run the Docker container. 
```
$ docker run -d -p 80:80 keen/dashboards
```

## Contributing

Contributions are 11,000,000% welcome! That's a lot!

Please file issues for any bugs you find or features you'd like to see. And if you're up for it, send in a pull request.

To develop, you'll need to first install dependencies using [Bower](http://bower.io/):

```
$ npm install -g bower
$ bower install
```

Note: Updates to the site backed by the **gh-pages** branch go live immediately once pull requests are reviewed and approved.

Note #2: This project is moving fast, so make sure and stay up to date. Here's what we suggest. Fork this repo, clone the fork, and add the original repo as a remote called `upstream`:

```
$ git clone https://github.com/keen/dashboards.git
$ cd dashboards
$ git remote add upstream https://github.com/keen/dashboards.git
```

Pull from `upstream` frequently to keep your local copy up to date:

```
$ git pull upstream gh-pages
```

## Support

Need a hand with something? Send us an email to [contact@keen.io](mailto:contact@keen.io) and we'll get back to you right away!
For technical questions, use the [`keen-io`](https://stackoverflow.com/questions/tagged/keen-io) tag on Stack Overflow.
