use ic_cdk::export::candid::{Principal};
use ic_cdk_macros::{update, query, pre_upgrade, post_upgrade};
use ic_cdk::storage;

use std::collections::HashSet;
use std::collections::HashMap;
use std::cell::RefCell;

type VideoStore = HashMap<Principal,HashSet<Principal>>;

thread_local! {
    static VIDEO_STORE: RefCell<VideoStore> = RefCell::new(VideoStore::default());
}

#[update]
pub async fn post_video(video_id: Principal){
    let caller = ic_cdk::api::caller();

    VIDEO_STORE.with(|wrapped_store|{
        let mut store = wrapped_store.borrow_mut();
        let caller_videos = match store.get_mut(&caller){
            Some(caller_videos) => caller_videos,
            None => {
                store.insert(caller, HashSet::new());
                store.get_mut(&caller).unwrap()
            }
        };
        caller_videos.insert(video_id);
    });
}

#[query]
pub async fn get_my_videos() -> Option<HashSet<Principal>>{
    let caller = ic_cdk::api::caller();
    
    return VIDEO_STORE.with(|store|{
        store.borrow().get(&caller).map(|set|{
            set.clone()
        })
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    VIDEO_STORE.with(|store|{
        storage::stable_save((store,)).unwrap();
    });
}

#[post_upgrade]
fn post_upgrade() {
    let (old_store,): (VideoStore,) = storage::stable_restore().unwrap();
    VIDEO_STORE.with(|store|{
        *store.borrow_mut() = old_store;
    });
}