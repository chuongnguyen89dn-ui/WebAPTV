#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>
#import <objc/runtime.h>

static const void *kSplitInstalled = &kSplitInstalled;

static void APTVInstallSplit(UIViewController *vc) {
    if (objc_getAssociatedObject(vc, kSplitInstalled)) return;
    objc_setAssociatedObject(vc, kSplitInstalled, @YES, OBJC_ASSOCIATION_RETAIN_NONATOMIC);

    UIView *root = vc.view;
    if (!root) return;
    root.backgroundColor = UIColor.blackColor;

    WKWebViewConfiguration *leftConfig = [WKWebViewConfiguration new];
    leftConfig.allowsInlineMediaPlayback = YES;
    if (@available(iOS 10.0, *)) leftConfig.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone;

    WKWebViewConfiguration *rightConfig = [WKWebViewConfiguration new];

    WKWebView *youtube = [[WKWebView alloc] initWithFrame:CGRectZero configuration:leftConfig];
    WKWebView *maps = [[WKWebView alloc] initWithFrame:CGRectZero configuration:rightConfig];
    youtube.translatesAutoresizingMaskIntoConstraints = NO;
    maps.translatesAutoresizingMaskIntoConstraints = NO;

    UIView *divider = [UIView new];
    divider.translatesAutoresizingMaskIntoConstraints = NO;
    divider.backgroundColor = [UIColor colorWithWhite:0.35 alpha:1.0];

    [root addSubview:youtube];
    [root addSubview:divider];
    [root addSubview:maps];

    UILayoutGuide *safe = root.safeAreaLayoutGuide;
    [NSLayoutConstraint activateConstraints:@[
      [youtube.leadingAnchor constraintEqualToAnchor:safe.leadingAnchor],
      [youtube.topAnchor constraintEqualToAnchor:safe.topAnchor],
      [youtube.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor],
      [youtube.widthAnchor constraintEqualToAnchor:safe.widthAnchor multiplier:0.5 constant:-1.0],
      [divider.leadingAnchor constraintEqualToAnchor:youtube.trailingAnchor],
      [divider.widthAnchor constraintEqualToConstant:2.0],
      [divider.topAnchor constraintEqualToAnchor:safe.topAnchor],
      [divider.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor],
      [maps.leadingAnchor constraintEqualToAnchor:divider.trailingAnchor],
      [maps.trailingAnchor constraintEqualToAnchor:safe.trailingAnchor],
      [maps.topAnchor constraintEqualToAnchor:safe.topAnchor],
      [maps.bottomAnchor constraintEqualToAnchor:safe.bottomAnchor]
    ]];

    [youtube loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://www.youtube.com/"]]];
    [maps loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://maps.google.com/"]]];
}

static IMP originalViewDidAppear;
static void patchedViewDidAppear(id self, SEL _cmd, BOOL animated) {
    ((void(*)(id,SEL,BOOL))originalViewDidAppear)(self,_cmd,animated);
    APTVInstallSplit((UIViewController *)self);
}

__attribute__((constructor))
static void APTVSplitInit(void) {
    Class cls = NSClassFromString(@"APTV.CarPlayBrowserViewController");
    if (!cls) cls = NSClassFromString(@"_TtC4APTV28CarPlayBrowserViewController");
    if (!cls) return;
    SEL sel = @selector(viewDidAppear:);
    Method method = class_getInstanceMethod(cls, sel);
    if (!method) return;
    originalViewDidAppear = method_getImplementation(method);
    class_replaceMethod(cls, sel, (IMP)patchedViewDidAppear, method_getTypeEncoding(method));
}
