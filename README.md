Dashboards by Keen IO
=====================

Sample projects to get you started!

Our goal for these assets is to be as helpful and familiar as possible, without getting in your way. To that end, these layouts are composed of a minimal set of custom styles on top of [Bootstrap v3.2](http://getbootstrap.com/), covering the most common use cases and layout configurations we've encountered so far.

* [Examples](http://keenlabs.github.io/dashboards/) for specific domains, data models and popular integrations
* [Layouts](http://keenlabs.github.io/dashboards/layouts) for pre-baked responsive dashboard views

## How to use these dashboards (non-developers)

Simply want to use one of these layouts? Here are a simple set of instructionals for downloading and getting started with making your own Keen dashboard!

1. Download the source. In the sidebar, is a Download Zip link. Click it to grab a copy of the repository.

2. Choose which layout you want to start with. Navigate to [layouts](http://keenlabs.github.io/dashboards/layouts/) and select which template might best suit your needs. Once you have selected a template, navigate to your downloaded zip, unzip it using an decompression tool like [7-zip](http://7-zip.en.softonic.com/) and navigate to the folder/layouts/(name of your chosen template).

3. Start editing! In the destination folder will exist an .html file in which you can edit with your favorite text editor. There are three things you need to do to edit your dashboard:
  1. Setup: If you're a registered Keen.io user, navigate to [your keen project](http://keen.io/home) or if you don't have a user at first, you can simply use some demo data that we've prepared for you. You can access those by going to the repository and navigating to demo-data. There, you will see some javascript files with some code in them. We will simply paste those in the .html file.
  2. Some copypasta. When you navigate to the bottom of the .html file, you can see that there are a bunch of script tags. Just before the end of the body tag, we're going to add in the code from sample.html. Simply copy and paste the code just before you see ```</body>```
  3. Once you've done that we need to hook up the specific items within the template to the code that we've just pasted in to our file. In line 21 of sample.html, you will see a line of code: ```document.getElementById('chart-01')```. That means that this *query* will try to find inside the html file a node with an id of 'chart-01'. In these templates, you will see lines of that resemble something like:
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
  You're finished! Congratulations on setting up your first Keen chart! Repeat step three with the rest of the items in the template to complete your dashboard!

## How to Contribute

Contributions are 11,000,000% welcome! That's a lot!

We work directly out of the **gh-pages** branch so contributions go live immediately, once your pull request is reviewed and approved.

Fork this repo, clone your fork, and add this repo as a remote:

```
$ git clone https://github.com/username/dashboards.git
$ cd dashboards
$ git remote add upstream https://github.com/keenlabs/dashboards.git
```

Pull frequently to keep your local copy up to date with the latest contributions:

```
$ git pull upstream gh-pages
```

Install dev dependencies with [Bower](http://bower.io/)

```
$ npm install -g bower
$ bower install
```

That's it! No fancy build processes yet, just keep things clean and simple :)


## Additional Resources

[Data Modeling Guide](https://github.com/keenlabs/data-modeling-guide/)

[API Technical Reference](https://keen.io/docs/api/reference/)

[API Status](http://status.keen.io/)


## Support

Need a hand with something? Join us in [HipChat](http://users.keen.io/), [IRC](http://webchat.freenode.net/?channels=keen-io), or shoot us an email at [contact@keen.io](mailto:contact@keen.io)
