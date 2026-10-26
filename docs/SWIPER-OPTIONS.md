# Swiper option coverage

The PDF viewer in 0.2.0 uses these options with reader-owned constraints: selected effect, original page identity, one row, fixed canvas height, reader zoom, and focus-based keyboard handling. CSS mode is only allowed for the Slide effect. See README.md for the PDF-specific behavior.

Bundled Swiper 14.3.0. Generated from its TypeScript declarations. This inventory identifies an access path, not proof that every option combination has been tested.

Common options have visual fields; additional JSON-compatible parameters use Advanced. Functions and instance references use the trusted wpff:before-slider hook. Internal navigation elements are owned by the plugin. Nested protected keys remain rejected. Options requiring a particular slide markup may require a custom integration.

| Swiper parameter | Access in wp-flipflop |
| --- | --- |
| `_emitClasses` | Advanced JSON for serializable values; hook for functions |
| `_loopSwapReset` | Advanced JSON for serializable values; hook for functions |
| `a11y` | Advanced JSON for serializable values; hook for functions |
| `allowSlideNext` | Advanced JSON for serializable values; hook for functions |
| `allowSlidePrev` | Advanced JSON for serializable values; hook for functions |
| `allowTouchMove` | Visual controls; nested data options through Advanced |
| `autoHeight` | Visual controls; nested data options through Advanced |
| `autoplay` | Visual controls; nested data options through Advanced |
| `breakpoints` | Visual controls; nested data options through Advanced |
| `breakpointsBase` | Advanced JSON for serializable values; hook for functions |
| `cardsEffect` | Advanced JSON for serializable values; hook for functions |
| `centerInsufficientSlides` | Advanced JSON for serializable values; hook for functions |
| `centeredSlides` | Visual controls; nested data options through Advanced |
| `centeredSlidesBounds` | Advanced JSON for serializable values; hook for functions |
| `containerModifierClass` | Advanced JSON for serializable values; hook for functions |
| `controller` | Trusted developer hook / plugin-managed |
| `coverflowEffect` | Advanced JSON for serializable values; hook for functions |
| `createElements` | Advanced JSON for serializable values; hook for functions |
| `creativeEffect` | Advanced JSON for serializable values; hook for functions |
| `cssMode` | Visual controls; nested data options through Advanced |
| `cubeEffect` | Advanced JSON for serializable values; hook for functions |
| `direction` | Visual controls; nested data options through Advanced |
| `edgeSwipeDetection` | Advanced JSON for serializable values; hook for functions |
| `edgeSwipeThreshold` | Advanced JSON for serializable values; hook for functions |
| `effect` | Visual controls; nested data options through Advanced |
| `enabled` | Advanced JSON for serializable values; hook for functions |
| `eventsPrefix` | Swiper Element only; not used by this renderer |
| `fadeEffect` | Advanced JSON for serializable values; hook for functions |
| `flipEffect` | Advanced JSON for serializable values; hook for functions |
| `focusableElements` | Advanced JSON for serializable values; hook for functions |
| `followFinger` | Advanced JSON for serializable values; hook for functions |
| `freeMode` | Visual controls; nested data options through Advanced |
| `grabCursor` | Advanced JSON for serializable values; hook for functions |
| `grid` | Visual controls; nested data options through Advanced |
| `hashNavigation` | Visual controls; nested data options through Advanced |
| `height` | Advanced JSON for serializable values; hook for functions |
| `history` | Advanced JSON for serializable values; hook for functions |
| `init` | Trusted developer hook / plugin-managed |
| `initialSlide` | Advanced JSON for serializable values; hook for functions |
| `injectStyles` | Swiper Element only; not used by this renderer |
| `injectStylesUrls` | Swiper Element only; not used by this renderer |
| `keyboard` | Visual controls; nested data options through Advanced |
| `lazyPreload` | Advanced JSON for serializable values; hook for functions |
| `lazyPreloadPrevNext` | Advanced JSON for serializable values; hook for functions |
| `lazyPreloaderClass` | Advanced JSON for serializable values; hook for functions |
| `longSwipes` | Advanced JSON for serializable values; hook for functions |
| `longSwipesMs` | Advanced JSON for serializable values; hook for functions |
| `longSwipesRatio` | Advanced JSON for serializable values; hook for functions |
| `loop` | Visual controls; nested data options through Advanced |
| `loopAddBlankSlides` | Advanced JSON for serializable values; hook for functions |
| `loopAdditionalSlides` | Advanced JSON for serializable values; hook for functions |
| `loopPreventsSliding` | Advanced JSON for serializable values; hook for functions |
| `maxBackfaceHiddenSlides` | Advanced JSON for serializable values; hook for functions |
| `modules` | Trusted developer hook / plugin-managed |
| `mousewheel` | Visual controls; nested data options through Advanced |
| `navigation` | Visual controls; nested data options through Advanced |
| `nested` | Advanced JSON for serializable values; hook for functions |
| `noSwiping` | Advanced JSON for serializable values; hook for functions |
| `noSwipingClass` | Advanced JSON for serializable values; hook for functions |
| `noSwipingSelector` | Advanced JSON for serializable values; hook for functions |
| `normalizeSlideIndex` | Advanced JSON for serializable values; hook for functions |
| `observeParents` | Advanced JSON for serializable values; hook for functions |
| `observeSlideChildren` | Advanced JSON for serializable values; hook for functions |
| `observer` | Advanced JSON for serializable values; hook for functions |
| `oneWayMovement` | Advanced JSON for serializable values; hook for functions |
| `pagination` | Visual controls; nested data options through Advanced |
| `parallax` | Visual controls; nested data options through Advanced |
| `passiveListeners` | Advanced JSON for serializable values; hook for functions |
| `preventClicks` | Advanced JSON for serializable values; hook for functions |
| `preventClicksPropagation` | Advanced JSON for serializable values; hook for functions |
| `preventInteractionOnTransition` | Advanced JSON for serializable values; hook for functions |
| `resistance` | Advanced JSON for serializable values; hook for functions |
| `resistanceRatio` | Advanced JSON for serializable values; hook for functions |
| `resizeObserver` | Advanced JSON for serializable values; hook for functions |
| `rewind` | Visual controls; nested data options through Advanced |
| `roundLengths` | Advanced JSON for serializable values; hook for functions |
| `runCallbacksOnInit` | Advanced JSON for serializable values; hook for functions |
| `scrollbar` | Visual controls; nested data options through Advanced |
| `setWrapperSize` | Advanced JSON for serializable values; hook for functions |
| `shortSwipes` | Advanced JSON for serializable values; hook for functions |
| `simulateTouch` | Advanced JSON for serializable values; hook for functions |
| `slideActiveClass` | Advanced JSON for serializable values; hook for functions |
| `slideBlankClass` | Advanced JSON for serializable values; hook for functions |
| `slideClass` | Advanced JSON for serializable values; hook for functions |
| `slideFullyVisibleClass` | Advanced JSON for serializable values; hook for functions |
| `slideNextClass` | Advanced JSON for serializable values; hook for functions |
| `slidePrevClass` | Advanced JSON for serializable values; hook for functions |
| `slideToClickedSlide` | Advanced JSON for serializable values; hook for functions |
| `slideVisibleClass` | Advanced JSON for serializable values; hook for functions |
| `slidesOffsetAfter` | Advanced JSON for serializable values; hook for functions |
| `slidesOffsetBefore` | Advanced JSON for serializable values; hook for functions |
| `slidesPerGroup` | Visual controls; nested data options through Advanced |
| `slidesPerGroupAuto` | Advanced JSON for serializable values; hook for functions |
| `slidesPerGroupSkip` | Advanced JSON for serializable values; hook for functions |
| `slidesPerView` | Visual controls; nested data options through Advanced |
| `snapToSlideEdge` | Advanced JSON for serializable values; hook for functions |
| `spaceBetween` | Visual controls; nested data options through Advanced |
| `speed` | Visual controls; nested data options through Advanced |
| `swipeHandler` | Advanced JSON for serializable values; hook for functions |
| `swiperElementNodeName` | Advanced JSON for serializable values; hook for functions |
| `threshold` | Advanced JSON for serializable values; hook for functions |
| `thumbs` | Trusted developer hook / plugin-managed |
| `touchAngle` | Advanced JSON for serializable values; hook for functions |
| `touchEventsTarget` | Advanced JSON for serializable values; hook for functions |
| `touchMoveStopPropagation` | Advanced JSON for serializable values; hook for functions |
| `touchRatio` | Advanced JSON for serializable values; hook for functions |
| `touchReleaseOnEdges` | Advanced JSON for serializable values; hook for functions |
| `touchStartForcePreventDefault` | Advanced JSON for serializable values; hook for functions |
| `touchStartPreventDefault` | Advanced JSON for serializable values; hook for functions |
| `uniqueNavElements` | Advanced JSON for serializable values; hook for functions |
| `updateOnWindowResize` | Advanced JSON for serializable values; hook for functions |
| `url` | Advanced JSON for serializable values; hook for functions |
| `userAgent` | Advanced JSON for serializable values; hook for functions |
| `virtual` | Trusted developer hook / plugin-managed |
| `virtualTranslate` | Advanced JSON for serializable values; hook for functions |
| `watchOverflow` | Advanced JSON for serializable values; hook for functions |
| `watchSlidesProgress` | Advanced JSON for serializable values; hook for functions |
| `width` | Advanced JSON for serializable values; hook for functions |
| `wrapperClass` | Advanced JSON for serializable values; hook for functions |
| `zoom` | Visual controls; nested data options through Advanced |
