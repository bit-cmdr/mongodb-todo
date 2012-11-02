(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['jquery', 'underscore', 'backbone', 'collections', 'models'], function($, _, Backbone, Collections, Models) {
    var BaseView, TodoList, TodoView, ToolbarView, UserView, Views;
    BaseView = (function(_super) {

      __extends(BaseView, _super);

      BaseView.prototype.subviews = [];

      function BaseView(options) {
        this.subviews = [];
        BaseView.__super__.constructor.call(this, options);
      }

      BaseView.prototype.render = function() {
        return this;
      };

      BaseView.prototype.remove = function() {
        this.trigger('removed', this);
        this.removeSubViews();
        this.off();
        this.undelegateEvents();
        this.$el.fadeOut('fast', function() {
          $(this).remove();
        });
      };

      BaseView.prototype.addSubView = function(view, insertMethod, targetSelector) {
        if (insertMethod == null) {
          insertMethod = 'append';
        }
        if (targetSelector == null) {
          targetSelector = null;
        }
        this.subviews.push(view);
        view.on('removed', this._removeSubView, this);
        if (!targetSelector) {
          this.$el[insertMethod](view.render().el);
        } else {
          this.$el.find(targetSelector)[insertMethod](view.render().el);
        }
        return this;
      };

      BaseView.prototype.removeSubViews = function() {
        _.invoke(this.subviews, 'remove');
        this.subviews = [];
      };

      BaseView.prototype.isValid = function() {
        var _ref, _ref1;
        if ((_ref = this.collection) != null ? _ref.isValid : void 0) {
          return this.collection.isValid();
        }
        if ((_ref1 = this.model) != null ? _ref1.isValid : void 0) {
          return this.model.isValid();
        }
        return true;
      };

      BaseView.prototype.isDirty = function() {
        var _ref, _ref1;
        if ((_ref = this.collection) != null ? _ref.isDirty : void 0) {
          return this.collection.isDirty();
        }
        if ((_ref1 = this.model) != null ? _ref1.isDirty : void 0) {
          return this.model.isDirty();
        }
        return false;
      };

      BaseView._removeSubView = function(view) {
        this.subviews = _.without(this.subviews, view);
      };

      return BaseView;

    })(Backbone.View);
    ToolbarView = (function(_super) {

      __extends(ToolbarView, _super);

      function ToolbarView() {
        return ToolbarView.__super__.constructor.apply(this, arguments);
      }

      ToolbarView.prototype.template = '';

      ToolbarView.prototype.events = {
        'click #add-user': 'addUser',
        'change #select-user': 'selectUser',
        'click #save': 'save'
      };

      ToolbarView.prototype.initialize = function(options) {
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.render, this);
        this.collection.on('remove', this.render, this);
        this.collection.on('change', this.render, this);
        return ToolbarView.__super__.initialize.call(this, options);
      };

      ToolbarView.prototype.render = function() {
        this.removeSubViews();
        this.$el.html(this.template(this.collection.toJSON()));
        if (this.collection.isValid() && this.collection.isDirty()) {
          $('#save').enable();
        } else {
          $('#save').disable();
        }
        return ToolbarView.__super__.render.call(this);
      };

      ToolbarView.prototype.addUser = function() {
        this.trigger('users:add');
      };

      ToolbarView.prototype.selectUser = function(ev) {
        this.trigger('users:select', this.collection.get($(ev.target).val()));
      };

      ToolbarView.prototype.save = function() {
        this.trigger('save-all');
      };

      ToolbarView.prototype.toggleNew = function(allow) {
        if (allow === true) {
          $('#add-user').enable();
        } else {
          $('#add-user').disable();
        }
      };

      return ToolbarView;

    })(BaseView);
    UserView = (function(_super) {

      __extends(UserView, _super);

      function UserView() {
        return UserView.__super__.constructor.apply(this, arguments);
      }

      UserView.prototype.template = '';

      UserView.prototype.events = {
        'keyup #user-name': 'updateUserName'
      };

      UserView.prototype.initialize = function(options) {
        this.model.on('change', this.render, this);
        return UserView.__super__.initialize.call(this, options);
      };

      UserView.prototype.render = function() {
        this.removeSubViews();
        this.$el.html(this.template(this.model.toJSON()));
        this.renderList();
        return UserView.__super__.render.call(this);
      };

      UserView.prototype.renderList = function() {
        var list, _ref;
        if ((_ref = this.model.tasks) != null ? _ref.length : void 0) {
          list = new TodoList({
            collection: this.model.tasks
          });
          this.addSubView(list);
        }
      };

      UserView.prototype.updateUserName = function(ev) {
        this.model.updateName($(ev.target).val());
      };

      return UserView;

    })(BaseView);
    TodoList = (function(_super) {

      __extends(TodoList, _super);

      function TodoList() {
        return TodoList.__super__.constructor.apply(this, arguments);
      }

      TodoList.prototype.template = '';

      TodoList.prototype.initialize = function(options) {
        this.collection.on('reset', this.render, this);
        return TodoList.__super__.initialize.call(this, options);
      };

      TodoList.prototype.render = function() {
        this.$el.html(this.template());
        this.renderRows();
        return TodoList.__super__.render.call(this);
      };

      TodoList.prototype.renderRows = function() {
        this.removeSubViews();
        this.collection.filter(function(model) {
          var view;
          view = new TodoView({
            model: model
          });
          this.addSubView(view);
        });
      };

      return TodoList;

    })(BaseView);
    TodoView = (function(_super) {

      __extends(TodoView, _super);

      function TodoView() {
        return TodoView.__super__.constructor.apply(this, arguments);
      }

      TodoView.prototype.template = '';

      TodoView.prototype.events = {
        'keyup input[type=text]': 'updateDescription',
        'click input[type=checkbox]': 'toggleComplete',
        'keyup input[type=checkbox]': 'toggleComplete'
      };

      TodoView.prototype.initialize = function(options) {
        this.model.on('change', this.render, this);
        return TodoView.__super__.initialize.call(this, options);
      };

      TodoView.prototype.render = function() {
        this.removeSubViews();
        this.$el.html(this.template(this.model.toJSON()));
        return TodoView.__super__.render.call(this);
      };

      TodoView.prototype.updateDescription = function(ev) {
        this.model.updateDescription($(ev.target).val());
      };

      TodoView.prototype.toggleComplete = function() {
        this.model.toggle();
      };

      return TodoView;

    })(BaseView);
    Views = Views != null ? Views : {};
    Views.ToolbarView;
    return Views.UserView;
  });

}).call(this);
